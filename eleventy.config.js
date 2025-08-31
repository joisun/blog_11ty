import collectionsConfig from './eleventy_config/collections.js'
import eventsConfig from './eleventy_config/events.js'
import filtersConfig from './eleventy_config/filters.js'
import markdownConfig from './eleventy_config/markdown.js'
import passthroughConfig from './eleventy_config/passthrough.js'
import pluginsConfig from './eleventy_config/plugins.js'
import serverConfig from './eleventy_config/server.js'

export default function (eleventyConfig) {
  // Apply configurations from separate files
  pluginsConfig(eleventyConfig)
  passthroughConfig(eleventyConfig)
  filtersConfig(eleventyConfig)
  collectionsConfig(eleventyConfig)
  eventsConfig(eleventyConfig)
  serverConfig(eleventyConfig)
  markdownConfig(eleventyConfig)

  return {
    /**
     * https://www.11ty.dev/docs/languages/#overriding-the-template-language
     * 解析markdown 文件中如果含有 vue template 大胡子语法 {{ }}， 将会报错，
     * 因为默认 eleventy 使用liquid 去  pre-process md 文件。 这里将这个规则禁用掉
     */
    markdownTemplateEngine: false,
    dir: {
      input: 'src',
      output: '_site',
    },
  }
}
