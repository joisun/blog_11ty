import dayjs from 'dayjs'
import readingTime from 'reading-time'

export default function (eleventyConfig) {
  // Filters
  eleventyConfig.addFilter('formatDate', (dateObj) => {
    // return DateTime.fromJSDate(dateObj).toISODate();
    return dayjs(dateObj).format('MMM DD, YYYY')
  })

  eleventyConfig.addFilter('readingTime', (content) => {
    if (!content)
      return '0 min read'
      // Adjust speed for Chinese/Technical content (default is 200)
    const stats = readingTime(content, { wordsPerMinute: 220 })
    return stats.text // returns "X min read"
  })

  // console.log filter
  eleventyConfig.addFilter('log', (value) => {
    console.warn('\n\n\n↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓COBSOLE_LOG_FILTER↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n', value, '\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑COBSOLE_LOG_FILTER↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑\n\n\n')
  })
}
