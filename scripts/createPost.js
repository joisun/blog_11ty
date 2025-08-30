#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');

// 导入模块
const { loadHomepageData } = require('./utils/dataLoader');
const { getPostDetails, confirmDiscard } = require('./utils/prompts');
const { sanitizeTitleForFilename } = require('./utils/filenameUtils');
const { createPostDirectory, writeMarkdownFile } = require('./utils/fileSystemUtils');
const { generateFrontMatter } = require('./utils/yamlUtils');
const { handleDiscard } = require('./utils/cleanupUtils');

async function createPost() {
    let newDirPath = ''; // 用于存储新创建的目录路径，以便在出错时清理
    let createdSuccessfully = false;

    try {
        // 1. 加载 homepage.json 数据
        const homepageData = await loadHomepageData();
        const tagOptions = homepageData.tag_options || [];
        const categories = homepageData.category ? homepageData.category.map(cat => cat.folder_name) : [];

        // 2. 获取文章详情 (标题、日期、分类、标签)
        const answers = await getPostDetails(tagOptions, categories);
        const originalTitle = answers.title.trim();
        const postDate = answers.date;
        const selectedCategory = answers.category;
        const selectedTags = answers.tags;

        // 3. 清理标题用于文件名
        const formattedTitle = sanitizeTitleForFilename(originalTitle);

        // 4. 创建文章目录和 assets 目录
        const { newDirPath: createdPath } = await createPostDirectory(selectedCategory, postDate, formattedTitle);
        newDirPath = createdPath; // 保存路径以便后续清理
        createdSuccessfully = true;

        // 5. 生成 YAML front matter
        const markdownContent = generateFrontMatter(originalTitle, postDate, selectedTags);

        // 6. 写入 index.md 文件
        const indexMdPath = path.join(newDirPath, 'index.md');
        await writeMarkdownFile(indexMdPath, markdownContent);

        console.log(chalk.green('\n文章创建成功！'));
        console.log(chalk.cyan(`文章路径: ${newDirPath}`));

    } catch (error) {
        console.error(chalk.red(`\n创建文章失败: ${error.message}`));
        if (createdSuccessfully && newDirPath) {
            // 如果目录已创建但后续操作失败，尝试清理
            console.log(chalk.yellow(`尝试清理已创建的目录: ${newDirPath}`));
            // 使用 cleanupUtils 中的 removeDirectory 来清理
            const { removeDirectory } = require('./utils/fileSystemUtils'); // 再次导入以确保可用
            await removeDirectory(newDirPath).catch(err => console.error(chalk.red(`清理失败: ${err.message}`)));
        }
        process.exit(1);
    }

    // 7. 询问用户是否要撤销创建
    const shouldDiscard = await confirmDiscard();
    await handleDiscard(shouldDiscard, newDirPath);
}

// 使用 commander 定义 CLI 命令
program
    .name('create-post')
    .description('CLI 工具，用于为 11ty 博客创建新的文章。')
    .action(createPost); // 当执行命令时，调用 createPost 函数

program.parse(process.argv); // 解析命令行参数