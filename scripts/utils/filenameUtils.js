const slugify = require('slugify');
const chalk = require('chalk');

function sanitizeTitleForFilename(originalTitle) {
    const formattedTitle = slugify(originalTitle, {
        lower: false,
        strict: true,
        replacement: '_'
    });

    const unsafeCharsRegex = /[\\:*?"<>|]/g;
    if (originalTitle.match(unsafeCharsRegex)) {
        console.log(chalk.yellow(`\n警告：原始标题包含在文件名中不安全的字符 (${originalTitle.match(unsafeCharsRegex).join('')})，这些字符已被替换为下划线。`));
        console.log(chalk.yellow(`生成的文件名将基于: ${formattedTitle}`));
    }
    return formattedTitle;
}

module.exports = {
    sanitizeTitleForFilename
};
