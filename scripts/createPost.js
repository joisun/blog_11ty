#!/usr/bin/env node

import { exec } from 'node:child_process'
import path from 'node:path'

import process from 'node:process'
import chalk from 'chalk'
import dayjs from 'dayjs'

import { handleDiscard } from './utils/cleanupUtils.js'
// 导入模块
import { loadHomepageData } from './utils/dataLoader.js'
import { updateHomepageData } from './utils/dataUtils.js'
import { sanitizeTitleForFilename } from './utils/filenameUtils.js'
import { createPostDirectory, removeDirectory, writeMarkdownFile } from './utils/fileSystemUtils.js'
import { confirmDiscard, getPostDetails, NEW_CATEGORY_OPTION } from './utils/prompts.js'
import { generateFrontMatter } from './utils/yamlUtils.js'

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {}

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      const value = args[i + 1]
      if (value && !value.startsWith('--')) {
        options[key] = value
        i++
      }
    }
  }

  return Object.keys(options).length > 0 ? options : null
}

async function createPost(options = null) {
  let newDirPath = ''
  let createdSuccessfully = false
  let newCategoryToSave = null
  let newTagsToSave = []
  let categories = []

  try {
    // 1. 加载 homepage.json 数据
    const homepageData = await loadHomepageData()
    const tagOptions = homepageData.tag_options || []
    categories = homepageData.category ? homepageData.category.map(cat => cat.folder_name) : []

    // 2. 获取文章详情（交互式或命令行参数）
    let answers
    if (options) {
      // 命令行模式
      answers = {
        title: options.title || '',
        date: options.date || dayjs().format('YYYY-MM-DD'),
        category: options.category || categories[0] || '',
        newCategory: null,
        tags: options.tags ? options.tags.split(',').map(t => t.trim()) : [],
        newTags: '',
      }
    }
    else {
      // 交互式模式
      answers = await getPostDetails(tagOptions, categories)
    }
    const originalTitle = answers.title.trim()
    const postDate = answers.date

    // 3. 处理分类
    let selectedCategoryFolderName = answers.category
    if (answers.category === NEW_CATEGORY_OPTION) {
      const newCategoryTitle = answers.newCategory.trim()
      selectedCategoryFolderName = sanitizeTitleForFilename(newCategoryTitle)
      newCategoryToSave = { title: newCategoryTitle, folderName: selectedCategoryFolderName }
    }
    else {
      // 如果不是创建新分类，则从 "1. category" 格式中解析出真实分类名
      selectedCategoryFolderName = selectedCategoryFolderName.replace(/^\d+\.\s/, '')
    }

    // 4. 处理标签
    const existingTags = answers.tags || []
    const newRawTags = answers.newTags ? answers.newTags.split(/[\s,]+/).filter(Boolean) : []
    const allTags = [...new Set([...existingTags, ...newRawTags])]
    newTagsToSave = newRawTags.filter(tag => !tagOptions.includes(tag))

    // 5. 清理标题用于文件名
    const formattedTitle = sanitizeTitleForFilename(originalTitle)

    // 6. 创建文章目录和 assets 目录
    const { newDirPath: createdPath } = await createPostDirectory(selectedCategoryFolderName, postDate, formattedTitle)
    newDirPath = createdPath
    createdSuccessfully = true

    // 7. 生成 YAML front matter
    const markdownContent = generateFrontMatter(originalTitle, postDate, allTags)

    // 8. 写入 index.md 文件
    const indexMdPath = path.join(newDirPath, 'index.md')
    await writeMarkdownFile(indexMdPath, markdownContent)

    console.log(chalk.green('\n✅ 文章创建成功!'))
    console.log(chalk.cyan(`📂 文章路径: ${newDirPath}`))

    if (!options) {
      exec(`open "${indexMdPath}"`)
    }
  }
  catch (error) {
    // 捕获除了用户中断之外的所有错误
    if (error.message !== 'User force closed the prompt with 0') {
      console.error(chalk.red(`\n❌ 创建文章失败: ${error.message}`))
    }
    if (createdSuccessfully && newDirPath) {
      console.log(chalk.yellow(`🧹 尝试清理已创建的目录: ${newDirPath}`))
      await removeDirectory(newDirPath).catch(err => console.error(chalk.red(`🧹 清理失败: ${err.message}`)))
    }
    throw error // Re-throw the error to be caught by the top-level handler
  }

  // 9. 询问用户是否要撤销创建（仅交互式模式）
  if (!options) {
    const shouldDiscard = await confirmDiscard()
    if (shouldDiscard) {
      await handleDiscard(true, newDirPath)
      return { success: false, path: null }
    }
  }

  // 10. 更新 homepage.json
  if (createdSuccessfully) {
    await updateHomepageData({
      newCategory: newCategoryToSave,
      newTags: newTagsToSave,
      allCategories: categories,
    })
  }

  return { success: true, path: newDirPath }
}

// Direct execution of the async function
const cliOptions = parseArgs()
createPost(cliOptions).catch((error) => {
  console.error(chalk.red(`\n❌ 脚本执行失败: ${error.message}`))
  process.exit(1)
})
