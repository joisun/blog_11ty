const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const HOMEPAGE_JSON_PATH = path.join(process.cwd(), 'src', '_data', 'homepage.json');

async function updateHomepageData({ newCategory, newTags, allCategories }) {
    try {
        const homepageData = await fs.readJson(HOMEPAGE_JSON_PATH);
        let updated = false;

        // Add new category if provided and it doesn't exist
        if (newCategory && !allCategories.includes(newCategory.title)) {
            homepageData.category.push({ title: newCategory.title, folder_name: newCategory.folderName });
            updated = true;
            console.log(chalk.blue(`
💾 已将新分类 "${newCategory.title}" 添加到 homepage.json`));
        }

        // Add new tags if any
        if (newTags && newTags.length > 0) {
            const existingTags = new Set(homepageData.tag_options);
            let addedTags = [];
            newTags.forEach(tag => {
                if (!existingTags.has(tag)) {
                    homepageData.tag_options.push(tag);
                    addedTags.push(tag);
                    updated = true;
                }
            });
            if (addedTags.length > 0) {
                console.log(chalk.blue(`💾 已将新标签 "${addedTags.join(', ')}" 添加到 homepage.json`));
            }
        }

        if (updated) {
            await fs.writeJson(HOMEPAGE_JSON_PATH, homepageData, { spaces: 2 });
        }
    } catch (error) {
        console.error(chalk.red(`
❌ 更新 homepage.json 失败: ${error.message}`));
    }
}

module.exports = {
    updateHomepageData
};

