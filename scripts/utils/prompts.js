const inquirer = require('inquirer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const { sanitizeTitleForFilename } = require('./filenameUtils');

dayjs.extend(customParseFormat);

const NEW_CATEGORY_OPTION = '✨ 创建新分类...';

async function getPostDetails(tagOptions, categories) {
    const numberedCategories = categories.map((cat, index) => `${index + 1}. ${cat}`);
    const categoryChoices = [
        NEW_CATEGORY_OPTION,
        new inquirer.Separator(),
        ...numberedCategories
    ];

    return await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: '📝 请输入文章标题:',
            validate: (input) => {
                if (input.trim() === '') return '标题不能为空。';
                if (sanitizeTitleForFilename(input).trim() === '') {
                    return '标题无效，净化后为空。请输入有效字符。';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'date',
            message: `📅 请输入文章日期 (YYYY-MM-DD) [按回车使用当前日期 ${dayjs().format('YYYY-MM-DD')}]:`,
            default: dayjs().format('YYYY-MM-DD'),
            validate: (input) => {
                if (!input) return true;
                if (!dayjs(input, 'YYYY-MM-DD', true).isValid()) {
                    return '日期格式不正确，请使用 YYYY-MM-DD 格式。';
                }
                return true;
            }
        },
        {
            type: 'list',
            name: 'category',
            message: '🗂️  请选择文章分类:',
            choices: categoryChoices,
            loop: false, // 禁用列表循环
            when: categories.length > 0
        },
        {
            type: 'input',
            name: 'newCategory',
            message: '✨ 请输入新分类的名称:',
            when: (answers) => answers.category === NEW_CATEGORY_OPTION,
            validate: (input) => {
                const trimmedInput = input.trim();
                if (trimmedInput === '') return '分类名称不能为空。';
                if (categories.includes(trimmedInput)) return '该分类已存在，请换一个名称。';
                if (sanitizeTitleForFilename(trimmedInput).trim() === '') {
                    return '分类名称无效，净化后为空。请输入有效字符。';
                }
                return true;
            }
        },
        {
            type: 'checkbox',
            name: 'tags',
            message: '🏷️  请选择文章标签 (可多选):',
            choices: tagOptions,
            when: tagOptions.length > 0,
            default: []
        },
        {
            type: 'input',
            name: 'newTags',
            message: '💡 请输入其它新标签 (用逗号或空格分隔，可留空):'
        }
    ]);
}


async function confirmDiscard() {
    const { discardChoice } = await inquirer.prompt([
        {
            type: 'input',
            name: 'discardChoice',
            message: "🤔 是否要撤销创建？(输入 'drop' 撤销，直接回车继续):",
            default: ''
        }
    ]);

    if (discardChoice.toLowerCase() === 'drop') {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `🗑️  确定要删除刚刚创建的文章吗？`,
                default: false
            }
        ]);
        return confirm;
    }
    return false;
}

module.exports = {
    getPostDetails,
    confirmDiscard,
    NEW_CATEGORY_OPTION
};