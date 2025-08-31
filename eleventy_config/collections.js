export default function (eleventyConfig) {
  // 收集所有标签
  eleventyConfig.addCollection('tagList', function (collection) {
    const tagsSet = new Set();
    collection.getAll().forEach((item) => {
      if (!item.data.tags) return;
      item.data.tags.filter((tag) => !['post', 'posts', 'all'].includes(tag)).forEach((tag) => tagsSet.add(tag));
    });
    return [...tagsSet].sort();
  });
}