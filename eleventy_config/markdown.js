const markdownIt = require('markdown-it')
const path = require('path')
const markdownItEleventyImg = require('markdown-it-eleventy-img')
const lazy_loading = require('markdown-it-image-lazy-loading')
const markdownItAnchor = require('markdown-it-anchor')
const markdownItLinkAttributes = require('markdown-it-link-attributes')
const { full: emoji } = require('markdown-it-emoji')
const { default: anchor } = require('markdown-it-anchor')

module.exports = function (eleventyConfig) {
  let markdownOptions = {
    html: true,
    breaks: true,
    linkify: true,
  }
  let markdownLib = new markdownIt(markdownOptions)

  //Add div around tables
  ;(markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n'),
    (markdownLib.renderer.rules.table_close = () => '</table>\n</div>'),
    // markdownItEleventyImg 用于解决图片在post 中链接错误的问题
    markdownLib.use(emoji)
  markdownLib.use(anchor, { permalink: anchor.permalink.headerLink() }) // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
  // markdownLib.use(require("markdown-it-anchor"), { permalink: true, permalinkBefore: true }); // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
  markdownLib.use(require('markdown-it-copy'))
  // 保留原有配置作为参考
  markdownLib.use(markdownItEleventyImg, {
    imgOptions: {
      widths: [1200],
      urlPath: `/images/`,
      outputDir: './_site/images/',
      formats: ['auto'],
      // 该选项将关闭图片压缩
      // https://sharp.pixelplumbing.com/api-output#jpeg
      // https://www.11ty.dev/docs/plugins/image/#advanced-control-of-sharp-image-processor
      // sharpJpegOptions:{
      //     quality:100
      // }

      sharpOptions: {
        animated: true,
        limitInputPixels: false,
      },
    },
    globalAttributes: {
      class: 'markdown-image',
      decoding: 'async',
      sizes: '100vw',
    },
    resolvePath: (filepath, env) => path.join(path.dirname(env.page.inputPath), filepath),
  })

  markdownLib.use(lazy_loading)
  markdownLib.use(markdownItAnchor).use(markdownItLinkAttributes, {
    matcher(href, config) {
      return href.startsWith('https:') || href.startsWith('http:')
    },
    // pattern: /^https?:\/\//, // 仅为外部链接添加 target="_blank"
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  })
  eleventyConfig.setLibrary('md', markdownLib)
}
