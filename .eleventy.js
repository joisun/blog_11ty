const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const path = require("path");
const markdownItEleventyImg = require("markdown-it-eleventy-img");


module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("media");

    eleventyConfig.addFilter("formatDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj).toISODate();
    });

    let markdownOptions = {
        html: true,
        breaks: true,
        linkify: true
    };
    let markdownLib = new markdownIt(markdownOptions);

    //Add div around tables
    markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n',
        markdownLib.renderer.rules.table_close = () => '</table>\n</div>',
        eleventyConfig.setLibrary("md", markdownLib.use(markdownItEleventyImg, {
            imgOptions: {
                widths: [600, 300],
                urlPath: "/images/",
                outputDir: "./_site/images/",
                formats: ["avif", "webp", "jpeg"]
              },
              globalAttributes: {
                class: "markdown-image",
                decoding: "async",
                sizes: "100vw"
              },
            resolvePath: (filepath, env) => path.join(path.dirname(env.page.inputPath), filepath)
        }))
};