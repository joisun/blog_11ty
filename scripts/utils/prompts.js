const inquirer = require('inquirer');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(customParseFormat);

async function getPostDetails(tagOptions, categories) {
    return await inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: '请输入文章标题:',
            validate: (input) => input.trim() !== '' ? true : '标题不能为空。'
        },
        {
            type: 'input',
            name: 'date',
            message: `请输入文章日期 (YYYY-MM-DD) [按回车使用当前日期 ${dayjs().format('YYYY-MM-DD')}]:`,
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
            message: '请选择文章分类:',
            choices: categories,
            when: categories.length > 0,
            validate: (input) => input ? true : '请选择一个分类。'
        },
        {
            type: 'checkbox',
            name: 'tags',
            message: '请选择文章标签 (可多选，按空格键选择/取消选择，回车确认):',
            choices: tagOptions,
            when: tagOptions.length > 0,
            default: []
        }
    ]);
}

async function confirmDiscard() {
    const { discardChoice } = await inquirer.prompt([
        {
            type: 'input',
            name: 'discardChoice',
            message: "是否要撤销创建？(输入 'drop' 撤销，直接回车继续):",
            default: ''
        }
    ]);

    if (discardChoice.toLowerCase() === 'drop') {
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `确定要删除刚刚创建的文章吗？`,
                default: false
            }
        ]);
        return confirm;
    }
    return false;
}

module.exports = {
    getPostDetails,
    confirmDiscard
};