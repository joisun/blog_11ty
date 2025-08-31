#!/usr/bin/env node

import path from 'node:path'

import process from 'node:process'
import chalk from 'chalk'

import { handleDiscard } from './utils/cleanupUtils.js'
// 导入模块
import { loadHomepageData } from './utils/dataLoader.js'
import { updateHomepageData } from './utils/dataUtils.js'
import { sanitizeTitleForFilename } from './utils/filenameUtils.js'
import { createPostDirectory, removeDirectory, writeMarkdownFile } from './utils/fileSystemUtils.js'
import { confirmDiscard, getPostDetails, NEW_CATEGORY_OPTION } from './utils/prompts.js'
import { generateFrontMatter } from './utils/yamlUtils.js'

async function createPost() {
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

    // 2. 获取文章详情
    const answers = await getPostDetails(tagOptions, categories)
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

  // 9. 询问用户是否要撤销创建
  const shouldDiscard = await confirmDiscard()
  if (shouldDiscard) {
    await handleDiscard(true, newDirPath)
  }
  else if (createdSuccessfully) {
    // 10. 如果用户没有撤销，并且文章创建成功，则更新 homepage.json
    await updateHomepageData({
      newCategory: newCategoryToSave,
      newTags: newTagsToSave,
      allCategories: categories,
    })
  }
}

// Direct execution of the async function
createPost().catch((error) => {
  console.error(chalk.red(`\n❌ 脚本执行失败: ${error.message}`))
  process.exit(1)
})
