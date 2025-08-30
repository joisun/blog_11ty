const slugify = require('slugify');
const chalk = require('chalk');

function sanitizeTitleForFilename(originalTitle) {
    // 移除在文件名中非法的字符，但保留中文、字母、数字等
    const unsafeCharsRegex = /[\/:*?"<>|]/g;
    const cleanedTitle = originalTitle.replace(unsafeCharsRegex, '_');

    const formattedTitle = slugify(cleanedTitle, {
        lower: false,       // 保留大写
        replacement: '_',   // 用下划线替换空格
        strict: false,      // 禁用严格模式以保留中文字符
        trim: true          // 修剪两端空格
    });

    if (originalTitle.match(unsafeCharsRegex)) {
        console.log(chalk.yellow(`
警告：原始标题包含在文件名中不安全的字符 (${originalTitle.match(unsafeCharsRegex).join('')})，这些字符已被替换。`));
        console.log(chalk.yellow(`生成的文件名将基于: ${formattedTitle}`));
    }
    return formattedTitle;
}

module.exports = {
    sanitizeTitleForFilename
};
