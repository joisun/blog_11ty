const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const path = require("path");
const fs = require("fs");
const dayjs = require('dayjs')
const tocPlugin = require("eleventy-plugin-toc");
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const { full: emoji } = require('markdown-it-emoji')
const SITE_PREFIX = process.env.SITE_PREFIX || "/";




module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(tocPlugin, { tags: ["h2", "h3", "h4"],wrapper: 'div',wrapperClass:"table-of-contents" });
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("media");
 

    let markdownOptions = {
        html: true,
        breaks: true,
        linkify: true
    };
    let markdownLib = new markdownIt(markdownOptions);

    //Add div around tables
    markdownLib.renderer.rules.table_open = () => '<div class="table-wrapper">\n<table>\n',
        markdownLib.renderer.rules.table_close = () => '</table>\n</div>',
        // markdownItEleventyImg 用于解决图片在post 中链接错误的问题
        markdownLib.use(emoji);
    markdownLib.use(require("markdown-it-anchor").default); // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
    markdownLib.use(require('markdown-it-copy'));
    markdownLib.use(markdownItEleventyImg, {
        imgOptions: {
            widths: [1200],
            urlPath: `/${SITE_PREFIX}/images/`,
            outputDir: "./_site/images/",
            formats: ["jpeg"],
            // 该选项将关闭图片压缩
            // https://sharp.pixelplumbing.com/api-output#jpeg
            // https://www.11ty.dev/docs/plugins/image/#advanced-control-of-sharp-image-processor
            // sharpJpegOptions:{
            //     quality:100
            // }
        
        },
        globalAttributes: {
            class: "markdown-image",
            decoding: "async",
            sizes: "100vw"
        },
        resolvePath: (filepath, env) => path.join(path.dirname(env.page.inputPath), filepath)
    })
    eleventyConfig.setLibrary("md", markdownLib)


    // dev server 404 page
    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
            ready: function (err, bs) {
                bs.addMiddleware("*", (req, res) => {
                    const NOT_FOUND_PATH = "_site/404.html";
                    if (!fs.existsSync(NOT_FOUND_PATH)) {
                        throw new Error(`Expected a \`${NOT_FOUND_PATH}\` file but could not find one. Did you create a 404.html template?`);
                    }
                    const content_404 = fs.readFileSync(NOT_FOUND_PATH);
                    // Add 404 http status code in request header.
                    res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
                    // Provides the 404 content without redirect.
                    res.write(content_404);
                    res.end();
                });
            }
        }
    });


    // Filters
    eleventyConfig.addFilter("formatDate", (dateObj) => {
        // return DateTime.fromJSDate(dateObj).toISODate();
        return dayjs(dateObj).format('MMM D, YYYY')
    });


    return{
        /**
         * https://www.11ty.dev/docs/languages/#overriding-the-template-language 
         * 解析markdown 文件中如果含有 vue template 大胡子语法 {{ }}， 将会报错，
         * 因为默认 eleventy 使用liquid 去  pre-process md 文件。 这里将这个规则禁用掉
         */
        markdownTemplateEngine: false 
    }
};
