import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import fs from 'fs-extra'

const PROJECT_ROOT = process.cwd()
const POSTS_BASE_PATH = path.join(PROJECT_ROOT, 'src', 'posts')

export async function createPostDirectory(selectedCategory, postDate, formattedTitle) {
  const newDirPath = path.join(POSTS_BASE_PATH, selectedCategory, `${postDate}-${formattedTitle}`)
  const assetsDirPath = path.join(newDirPath, 'assets')

  await fs.mkdirp(newDirPath)
  await fs.mkdirp(assetsDirPath)

  return { newDirPath, assetsDirPath }
}

export async function writeMarkdownFile(filePath, content) {
  await fs.writeFile(filePath, content)
}

export async function removeDirectory(dirPath) {
  try {
    await fs.remove(dirPath)
    console.log(chalk.green(`
已删除文章目录: ${dirPath}`))
  }
  catch (error) {
    console.error(chalk.red(`
删除失败: ${error.message}`))
  }
}

export { POSTS_BASE_PATH } // Export for external use if needed, e.g., for relative path calculation
