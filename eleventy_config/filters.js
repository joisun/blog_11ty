import dayjs from 'dayjs'

export default function (eleventyConfig) {
  // Filters
  eleventyConfig.addFilter('formatDate', (dateObj) => {
    // return DateTime.fromJSDate(dateObj).toISODate();
    return dayjs(dateObj).format('MMM DD, YYYY')
  })
  // console.log filter
  eleventyConfig.addFilter('log', (value) => {
    console.warn('\n\n\n↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓COBSOLE_LOG_FILTER↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n', value, '\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑COBSOLE_LOG_FILTER↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑\n\n\n')
  })
}
