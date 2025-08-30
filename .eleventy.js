const pluginsConfig = require('./eleventy_config/plugins.js')
const passthroughConfig = require('./eleventy_config/passthrough.js')
const filtersConfig = require('./eleventy_config/filters.js')
const collectionsConfig = require('./eleventy_config/collections.js')
const eventsConfig = require('./eleventy_config/events.js')
const serverConfig = require('./eleventy_config/server.js')
const markdownConfig = require('./eleventy_config/markdown.js')

module.exports = function (eleventyConfig) {
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
