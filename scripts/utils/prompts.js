import prompts from 'prompts';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { sanitizeTitleForFilename } from './filenameUtils.js';

dayjs.extend(customParseFormat);

export const NEW_CATEGORY_OPTION = '✨ 创建新分类...';

export async function getPostDetails(tagOptions, categories) {
    const numberedCategories = categories.map((cat, index) => ({ title: `${index + 1}. ${cat}`, value: cat }));
    const categoryChoices = [
        { title: NEW_CATEGORY_OPTION, value: NEW_CATEGORY_OPTION },
        ...numberedCategories
    ];

    const questions = [
        {
            type: 'text',
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
            type: 'text',
            name: 'date',
            message: `📅 请输入文章日期 (YYYY-MM-DD) [按回车使用当前日期 ${dayjs().format('YYYY-MM-DD')}]:`,
            initial: dayjs().format('YYYY-MM-DD'),
            validate: (input) => {
                if (!input) return true;
                if (!dayjs(input, 'YYYY-MM-DD', true).isValid()) {
                    return '日期格式不正确，请使用 YYYY-MM-DD 格式。';
                }
                return true;
            }
        },
        {
            type: categories.length > 0 ? 'select' : null,
            name: 'category',
            message: '🗂️  请选择文章分类:',
            choices: categoryChoices,
            initial: 0,
            // when: categories.length > 0 // prompts handles this with type: null
        },
        {
            type: (prev) => prev === NEW_CATEGORY_OPTION ? 'text' : null,
            name: 'newCategory',
            message: '✨ 请输入新分类的名称:',
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
            type: tagOptions.length > 0 ? 'multiselect' : null,
            name: 'tags',
            message: '🏷️  请选择文章标签 (可多选): ',
            choices: tagOptions.map(tag => ({ title: tag, value: tag })),
            // initial: [] // prompts default is empty array for multiselect
        },
        {
            type: 'text',
            name: 'newTags',
            message: '💡 请输入其它新标签 (用逗号或空格分隔，可留空):'
        }
    ];

    const answers = await prompts(questions);

    // prompts returns undefined for skipped questions, convert to null or empty string for consistency
    if (answers.category === undefined) answers.category = null;
    if (answers.newCategory === undefined) answers.newCategory = null;
    if (answers.tags === undefined) answers.tags = [];
    if (answers.newTags === undefined) answers.newTags = '';

    return answers;
}


export async function confirmDiscard() {
    const response = await prompts({
        type: 'text',
        name: 'discardChoice',
        message: "🤔 是否要撤销创建？(输入 'drop' 撤销，直接回车继续):",
        initial: ''
    });

    if (response.discardChoice && response.discardChoice.toLowerCase() === 'drop') {
        const confirmResponse = await prompts({
            type: 'confirm',
            name: 'confirm',
            message: `🗑️  确定要删除刚刚创建的文章吗？`,
            initial: false
        });
        return confirmResponse.confirm;
    }
    return false;
}