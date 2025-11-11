import chalk from 'chalk'
// import slugify from 'slugify'

export function sanitizeTitleForFilename(originalTitle) {
  // 移除在文件名中非法的字符，但保留中文、字母、数字等
  const unsafeCharsRegex = /[/:*?"<>|]/g
  let cleanedTitle = originalTitle.replace(unsafeCharsRegex, '_')

  // 手动处理：保留中文、英文字母、数字、下划线、连字符
  // 将空格和多个连续空格替换为单个下划线
  cleanedTitle = cleanedTitle.replace(/\s+/g, '_')

  // 移除连续的下划线
  cleanedTitle = cleanedTitle.replace(/_+/g, '_')

  // 移除开头和结尾的下划线
  cleanedTitle = cleanedTitle.replace(/^_+|_+$/g, '')

  if (originalTitle.match(unsafeCharsRegex)) {
    console.log(chalk.yellow(`
警告：原始标题包含在文件名中不安全的字符 (${originalTitle.match(unsafeCharsRegex).join('')})，这些字符已被替换。`))
    console.log(chalk.yellow(`生成的文件名将基于: ${cleanedTitle}`))
  }
  return cleanedTitle
  //   // 移除在文件名中非法的字符，但保留中文、字母、数字等
  //   const unsafeCharsRegex = /[/:*?"<>|]/g
  //   const cleanedTitle = originalTitle.replace(unsafeCharsRegex, '_')

  //   const formattedTitle = slugify(cleanedTitle, {
  //     lower: false, // 保留大写
  //     replacement: '_', // 用下划线替换空格
  //     strict: false, // 禁用严格模式以保留中文字符
  //     trim: true, // 修剪两端空格
  //   })

//   if (originalTitle.match(unsafeCharsRegex)) {
//     console.log(chalk.yellow(`
// 警告：原始标题包含在文件名中不安全的字符 (${originalTitle.match(unsafeCharsRegex).join('')})，这些字符已被替换。`))
//     console.log(chalk.yellow(`生成的文件名将基于: ${formattedTitle}`))
//   }
//   return formattedTitle
}
