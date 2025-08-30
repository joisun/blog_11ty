const dayjs = require('dayjs')

module.exports = function (eleventyConfig) {
  // Filters
  eleventyConfig.addFilter('formatDate', (dateObj) => {
    // return DateTime.fromJSDate(dateObj).toISODate();
    return dayjs(dateObj).format('MMM DD, YYYY')
  })
  // console.log filter
  eleventyConfig.addFilter('log', (value) => {
    console.log('\n\n\n↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓COBSOLE_LOG_FILTER↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n', value, '\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑COBSOLE_LOG_FILTER↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑\n\n\n')
  })
}
