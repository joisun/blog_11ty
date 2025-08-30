const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const PROJECT_ROOT = process.cwd();
const POSTS_BASE_PATH = path.join(PROJECT_ROOT, 'src', 'posts');

async function createPostDirectory(selectedCategory, postDate, formattedTitle) {
    const newDirPath = path.join(POSTS_BASE_PATH, selectedCategory, `${postDate}-${formattedTitle}`);
    const assetsDirPath = path.join(newDirPath, 'assets');

    await fs.mkdirp(newDirPath);
    await fs.mkdirp(assetsDirPath);

    return { newDirPath, assetsDirPath };
}

async function writeMarkdownFile(filePath, content) {
    await fs.writeFile(filePath, content);
}

async function removeDirectory(dirPath) {
    try {
        await fs.remove(dirPath);
        console.log(chalk.green(`
已删除文章目录: ${dirPath}`));
    } catch (error) {
        console.error(chalk.red(`
删除失败: ${error.message}`));
    }
}

module.exports = {
    createPostDirectory,
    writeMarkdownFile,
    removeDirectory,
    POSTS_BASE_PATH // Export for external use if needed, e.g., for relative path calculation
};