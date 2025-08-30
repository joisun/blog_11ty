const { execSync } = require('child_process')

module.exports = function (eleventyConfig) {
  // pagefind
  // https://rknight.me/blog/using-pagefind-with-eleventy-for-search/
  eleventyConfig.on('eleventy.after', () => {
    execSync(`pnpm pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
    // execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
  })

  // page enter before hook
  eleventyConfig.on('eleventy.before', () => {
    console.log('1before hook work')
  })
}
