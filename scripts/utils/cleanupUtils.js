import chalk from 'chalk';
import path from 'path';
import { removeDirectory } from './fileSystemUtils.js'; // Assuming fileSystemUtils is in the same utils directory

export async function handleDiscard(shouldDiscard, newDirPath) {
    if (shouldDiscard) {
        await removeDirectory(newDirPath);
    } else {
        console.log(chalk.yellow('\n取消删除，保留文章。'));
    }
    // Provide manual cd instruction regardless of discard choice
    console.log(chalk.blue(`\n请手动切换到新创建的目录: ${chalk.white.bold(`cd ${path.relative(process.cwd(), newDirPath)}`)}`));
}