export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' })
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' })
  // https://www.freecodecamp.org/news/learn-eleventy/
  eleventyConfig.addPassthroughCopy({ 'src/_data/favicon-light.svg': '/favicon-light.svg' })
  eleventyConfig.addPassthroughCopy({ 'src/_data/favicon-dark.svg': '/favicon-dark.svg' })
}
