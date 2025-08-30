const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const rssPlugin = require('@11ty/eleventy-plugin-rss')
const tocPlugin = require('eleventy-plugin-toc')
const pluginMermaid = require('@kevingimbel/eleventy-plugin-mermaid')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(rssPlugin)
  eleventyConfig.addPlugin(tocPlugin, { tags: ['h2', 'h3', 'h4'], wrapper: 'nav', wrapperClass: 'table-of-contents' })
  eleventyConfig.addPlugin(pluginMermaid, {
    // load mermaid from local assets directory
    mermaid_js_src: 'https://unpkg.com/mermaid@10.9.1/dist/mermaid.esm.min.mjs',
    html_tag: 'div',
    extra_classes: 'graph',
    mermaid_config: {
      startOnLoad: true,
      theme: 'dark',
    },
  })
}
