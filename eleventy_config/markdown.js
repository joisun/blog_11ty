import path from 'node:path'
import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItCopy from 'markdown-it-copy'
import markdownItEleventyImg from 'markdown-it-eleventy-img'
import { full as emoji } from 'markdown-it-emoji'
import lazy_loading from 'markdown-it-image-lazy-loading'
import markdownItLinkAttributes from 'markdown-it-link-attributes'

export default function (eleventyConfig) {
  const markdownOptions = {
    html: true,
    breaks: true,
    linkify: true,
  }
  const markdownLib = new MarkdownIt(markdownOptions)

  // 自定义 fence renderer：支持 ```map 语法
  // 输出隐藏的 <template> 占位符，地图由模板层控制位置
  const defaultFence = markdownLib.renderer.rules.fence
  markdownLib.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim() === 'map') {
      const kmlFile = token.content.trim()
      const mdDir = path.dirname(env.page.inputPath)
      const kmlAbsPath = path.join(mdDir, kmlFile)
      const kmlWebPath = `/${path.relative('src', kmlAbsPath)}`
      return `<template class="kml-source" data-kml="${kmlWebPath}"></template>`
    }
    return defaultFence(tokens, idx, options, env, self)
  }

  // 其他配置保持不变
  markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n'
  markdownLib.renderer.rules.table_close = () => '</table>\n</div>'

  markdownLib.use(emoji)
  markdownLib.use(markdownItAnchor, { permalink: markdownItAnchor.permalink.headerLink() })
  markdownLib.use(markdownItCopy)

  markdownLib.use(markdownItEleventyImg, {
    imgOptions: {
      widths: [1200],
      urlPath: `/images/`,
      outputDir: './_site/images/',
      formats: ['auto'],
      sharpOptions: { animated: true, limitInputPixels: false },
    },
    globalAttributes: { class: 'markdown-image', decoding: 'async', sizes: '100vw' },
    resolvePath: (filepath, _env) => path.join(path.dirname(_env.page.inputPath), filepath),
  })

  markdownLib.use(lazy_loading)
  markdownLib.use(markdownItLinkAttributes, {
    matcher(href, _config) { return href.startsWith('https:') || href.startsWith('http:') },
    attrs: { target: '_blank', rel: 'noopener noreferrer' },
  })
  eleventyConfig.setLibrary('md', markdownLib)
}
