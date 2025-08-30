const yaml = require('js-yaml');

function generateFrontMatter(title, date, tags) {
    const frontMatter = {
        title: title,
        date: date,
    };
    if (tags && tags.length > 0) {
        frontMatter.tags = tags;
    }
    return `---\n${yaml.dump(frontMatter)}---\n\n`;
}

module.exports = {
    generateFrontMatter
};
