import rssPlugin from '@11ty/eleventy-plugin-rss'
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import pluginMermaid from '@kevingimbel/eleventy-plugin-mermaid'
import tocPlugin from 'eleventy-plugin-toc'

export default function (eleventyConfig) {
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
