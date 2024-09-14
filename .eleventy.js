const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process')
const markdownIt = require("markdown-it");
const dayjs = require('dayjs')
const tocPlugin = require("eleventy-plugin-toc");
const pluginMermaid = require("@kevingimbel/eleventy-plugin-mermaid");
const markdownItEleventyImg = require("markdown-it-eleventy-img");
const lazy_loading = require('markdown-it-image-lazy-loading');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownItAnchor = require("markdown-it-anchor");
const markdownItLinkAttributes = require("markdown-it-link-attributes");
const { full: emoji } = require('markdown-it-emoji')
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const { default: anchor } = require("markdown-it-anchor");
const SITE_PREFIX = process.env.SITE_PREFIX || "/";


module.exports = function (eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(rssPlugin);
    eleventyConfig.addPlugin(tocPlugin, { tags: ["h2", "h3", "h4"], wrapper: 'nav', wrapperClass: "table-of-contents" });
    eleventyConfig.addPlugin(pluginMermaid, {
        // load mermaid from local assets directory
        mermaid_js_src: 'https://unpkg.com/mermaid@10.9.1/dist/mermaid.esm.min.mjs',
        html_tag: 'div',
        extra_classes: 'graph',
        mermaid_config: {
            'startOnLoad': true,
            'theme': 'dark'
        }
    });
    eleventyConfig.addPassthroughCopy("css");
    eleventyConfig.addPassthroughCopy("assets");
    // https://www.freecodecamp.org/news/learn-eleventy/
    eleventyConfig.addPassthroughCopy({ "./_data/favicon-light.svg": "/favicon-light.svg" });
    eleventyConfig.addPassthroughCopy({ "./_data/favicon-dark.svg": "/favicon-dark.svg" });



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
    markdownLib.use(anchor, { permalink: anchor.permalink.headerLink() }); // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
    // markdownLib.use(require("markdown-it-anchor"), { permalink: true, permalinkBefore: true }); // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
    markdownLib.use(require('markdown-it-copy'));
    markdownLib.use(markdownItEleventyImg, {
        imgOptions: {
            widths: [1200],
            urlPath: `/${SITE_PREFIX}/images/`,
            outputDir: "./_site/images/",
            formats: ["auto"],
            // 该选项将关闭图片压缩
            // https://sharp.pixelplumbing.com/api-output#jpeg
            // https://www.11ty.dev/docs/plugins/image/#advanced-control-of-sharp-image-processor
            // sharpJpegOptions:{
            //     quality:100
            // }

            sharpOptions: {
                animated: true,
                limitInputPixels: false
            },

        },
        globalAttributes: {
            class: "markdown-image",
            decoding: "async",
            sizes: "100vw"
        },
        resolvePath: (filepath, env) => path.join(path.dirname(env.page.inputPath), filepath)
    })
    markdownLib.use(lazy_loading)
    markdownLib.use(markdownItAnchor).use(markdownItLinkAttributes, {
        matcher(href, config) {
            return href.startsWith("https:") || href.startsWith("http:");
        },
        // pattern: /^https?:\/\//, // 仅为外部链接添加 target="_blank"
        attrs: {
            target: "_blank",
            rel: "noopener noreferrer"
        }
    });
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
        return dayjs(dateObj).format('MMM DD, YYYY')
    });
    // console.log filter
    eleventyConfig.addFilter('log', value => {
        console.log("\n\n\n↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓COBSOLE_LOG_FILTER↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n", value, "\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑COBSOLE_LOG_FILTER↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑\n\n\n")
    })


    // pagefind
    // https://rknight.me/blog/using-pagefind-with-eleventy-for-search/
    eleventyConfig.on('eleventy.after', () => {
        execSync(`pnpm pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
        // execSync(`npx pagefind --site _site --glob \"**/*.html\"`, { encoding: 'utf-8' })
    })

    // page enter before hook
    eleventyConfig.on('eleventy.before', () => {
        console.log("1before hook work")
    })

    // https://www.11ty.dev/docs/dev-server/
    eleventyConfig.setServerOptions({
        showAllHosts: true,
        port: 9999,

    })


    return {
        /**
         * https://www.11ty.dev/docs/languages/#overriding-the-template-language 
         * 解析markdown 文件中如果含有 vue template 大胡子语法 {{ }}， 将会报错，
         * 因为默认 eleventy 使用liquid 去  pre-process md 文件。 这里将这个规则禁用掉
         */
        markdownTemplateEngine: false,
        pathPrefix: SITE_PREFIX,
    }
};
