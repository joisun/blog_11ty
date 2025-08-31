import yaml from 'js-yaml';

export function generateFrontMatter(title, date, tags) {
    const frontMatter = {
        title: title,
        date: date,
    };
    if (tags && tags.length > 0) {
        frontMatter.tags = tags;
    }
    return `---
${yaml.dump(frontMatter)}---

`;
}