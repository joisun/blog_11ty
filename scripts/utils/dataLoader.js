import path from 'node:path'
import process from 'node:process'
import chalk from 'chalk'
import fs from 'fs-extra'

const PROJECT_ROOT = process.cwd()
const DATA_PATH = path.join(PROJECT_ROOT, 'src', '_data', 'homepage.json')

export async function loadHomepageData() {
  try {
    return await fs.readJson(DATA_PATH)
  }
  catch (error) {
    console.error(chalk.red(`错误：无法读取 ${DATA_PATH}。请确保文件存在且格式正确。`))
    console.error(chalk.red(`详细错误: ${error.message}`))
    process.exit(1)
  }
}
