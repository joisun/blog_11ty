#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// 导入模块
const { loadHomepageData } = require('./utils/dataLoader');
const { getPostDetails, confirmDiscard, NEW_CATEGORY_OPTION } = require('./utils/prompts');
const { sanitizeTitleForFilename } = require('./utils/filenameUtils');
const { createPostDirectory, writeMarkdownFile } = require('./utils/fileSystemUtils');
const { generateFrontMatter } = require('./utils/yamlUtils');
const { handleDiscard } = require('./utils/cleanupUtils');
const { updateHomepageData } = require('./utils/dataUtils');

async function createPost() {
    let newDirPath = '';
    let createdSuccessfully = false;
    let newCategoryToSave = null;
    let newTagsToSave = [];
    let categories = [];

    try {
        // 1. 加载 homepage.json 数据
        const homepageData = await loadHomepageData();
        const tagOptions = homepageData.tag_options || [];
        categories = homepageData.category ? homepageData.category.map(cat => cat.folder_name) : [];

        // 2. 获取文章详情
        const answers = await getPostDetails(tagOptions, categories);
        const originalTitle = answers.title.trim();
        const postDate = answers.date;

        // 3. 处理分类
        let selectedCategoryFolderName = answers.category;
        if (answers.category === NEW_CATEGORY_OPTION) {
            const newCategoryTitle = answers.newCategory.trim();
            selectedCategoryFolderName = sanitizeTitleForFilename(newCategoryTitle);
            newCategoryToSave = { title: newCategoryTitle, folderName: selectedCategoryFolderName };
        } else {
            // 如果不是创建新分类，则从 "1. category" 格式中解析出真实分类名
            selectedCategoryFolderName = selectedCategoryFolderName.replace(/^\d+\.\s/, '');
        }

        // 4. 处理标签
        const existingTags = answers.tags || [];
        const newRawTags = answers.newTags ? answers.newTags.split(/[,\s]+/).filter(Boolean) : [];
        const allTags = [...new Set([...existingTags, ...newRawTags])];
        newTagsToSave = newRawTags.filter(tag => !tagOptions.includes(tag));

        // 5. 清理标题用于文件名
        const formattedTitle = sanitizeTitleForFilename(originalTitle);

        // 6. 创建文章目录和 assets 目录
        const { newDirPath: createdPath } = await createPostDirectory(selectedCategoryFolderName, postDate, formattedTitle);
        newDirPath = createdPath;
        createdSuccessfully = true;

        // 7. 生成 YAML front matter
        const markdownContent = generateFrontMatter(originalTitle, postDate, allTags);

        // 8. 写入 index.md 文件
        const indexMdPath = path.join(newDirPath, 'index.md');
        await writeMarkdownFile(indexMdPath, markdownContent);

        console.log(chalk.green('\n✅ 文章创建成功！'));
        console.log(chalk.cyan(`📂 文章路径: ${newDirPath}`));

    } catch (error) {
        // 捕获除了用户中断之外的所有错误
        if (error.message !== 'User force closed the prompt with 0') {
            console.error(chalk.red(`\n❌ 创建文章失败: ${error.message}`));
        }
        if (createdSuccessfully && newDirPath) {
            console.log(chalk.yellow(`🧹 尝试清理已创建的目录: ${newDirPath}`));
            const { removeDirectory } = require('./utils/fileSystemUtils');
            await removeDirectory(newDirPath).catch(err => console.error(chalk.red(`🧹 清理失败: ${err.message}`)));
        }
        process.exit(1);
    }

    // 9. 询问用户是否要撤销创建
    const shouldDiscard = await confirmDiscard();
    if (shouldDiscard) {
        await handleDiscard(true, newDirPath);
    } else if (createdSuccessfully) {
        // 10. 如果用户没有撤销，并且文章创建成功，则更新 homepage.json
        await updateHomepageData({
            newCategory: newCategoryToSave,
            newTags: newTagsToSave,
            allCategories: categories
        });
    }
}

// 使用 commander 定义 CLI 命令
program
    .name('create-post')
    .description('CLI 工具，用于为 11ty 博客创建新的文章。')
    .action(createPost);

program.parse(process.argv);

