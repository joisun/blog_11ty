import markdownIt from 'markdown-it';
import path from 'path';
import markdownItEleventyImg from 'markdown-it-eleventy-img';
import lazy_loading from 'markdown-it-image-lazy-loading';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import { full as emoji } from 'markdown-it-emoji';
import markdownItCopy from 'markdown-it-copy';

export default function (eleventyConfig) {
  let markdownOptions = {
    html: true,
    breaks: true,
    linkify: true,
  };
  let markdownLib = new markdownIt(markdownOptions);

  //Add div around tables
  markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n';
  markdownLib.renderer.rules.table_close = () => '</table>\n</div>';

  // markdownItEleventyImg 用于解决图片在post 中链接错误的问题
  markdownLib.use(emoji);
  markdownLib.use(markdownItAnchor, { permalink: markdownItAnchor.permalink.headerLink() });
  markdownLib.use(markdownItCopy);
  // 保留原有配置作为参考
  markdownLib.use(markdownItEleventyImg, {
    imgOptions: {
      widths: [1200],
      urlPath: `/images/`,
      outputDir: './_site/images/',
      formats: ['auto'],
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
  });

  markdownLib.use(lazy_loading);
  markdownLib.use(markdownItLinkAttributes, {
    matcher(href, config) {
      return href.startsWith('https:') || href.startsWith('http:');
    },
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  });
  eleventyConfig.setLibrary('md', markdownLib);
}