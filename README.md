# less is more
Fork on  [11ty-no-style-please](https://github.com/stopnoanime/11ty-no-style-please)

A minimalist blog template for the [eleventy](https://www.11ty.dev/) static site generator. 


---


## [Check out the demo page](https://joisun.github.io/blog_11ty/)

# Features
- Simple design
- Fast, minimal amount of CSS to download
- Pre-configured CMS
- Easy to use and deploy
- Better read expreience
- Prepared github workflow action ci
- With Recent Posts, Tags, Archive Pages
- Fully responsive
- Supports Site visit summarize, google analysis
- Giscus 

# Usage

Fork -> Clone -> New Post -> Push ->(auto github actions running. Deploying to github page: https://your_github_id_xxx.github.io/blog_11ty/)


---
You can also run eleventy locally and then deploy it manually:

### 1. Clone the repository ( or use it as a template then clone )

`git clone https://github.com/joisun/blog_11ty`

### 2. Install the required packages

`pnpm i`

### 3. Serve the site for local development

`pnpm start`

### 4. Clean cache and re-start

`pnpm run clean`

### 4. Build the site

`pnpm run build`



# Configuration

All configuration files are located in the `_data` folder and are in `json` format.
Here I describe what each field means:

### - site.json
```
title: default page title
description: global page description
language: HTML language value
back_home_text: text to show on "back home" button on every post
url: site url, used in Netlify CMS
google_analytics_id: "G-xxxxxx" , google analysis support id

```

### - homepage.json
```
title: homepage title
subtitle: text to show under homepage title
menu: The menu object, configures how the menu looks
```

#### - The menu object
It should be an array of entires, each entry has the following parameters:
```
title: entry title
url: if set, the entry is a link pointing to this url
folder_name: accepts a string, if set, the entry will show a nested list of all posts with the tag that folder_name is set to
entries: an nested array of entries with the same available parameters
```

For example use, look at the default menu object
```json
"category": [
    {
        "title": "read more here",
        "entries": [
            {
                "title": "github",
                "url": "http://github.com/stopnoanime/11ty-no-style-please"
            }
        ]
    },
    {
        "title": "all posts with the 'post' tag",
        "folder_name": "post"
    }
]
```

#### - The footer object

```json
  "footer": {
    "desc": "",
    "subdesc": "",
    "logo": "",
    "navs": [
      {
        "title": "xxxx",
        "url": "#"
      }
    ],
    "links": [
      {
        "title": "xxxx",
        "url": "https://xxxxx",
        "iconPath": "M12 2A10 ...."
      },
      {
        "title": "xxxx",
        "url": "https://xxxx",
        "iconPath": "M12 2A10 ....."
      }
    ]
  }
```








### More
build：
```bash
    "build": "env NODE_ENV=production SITE_PREFIX=blog_11ty npx @11ty/eleventy --pathprefix 'blog_11ty'",
```
`SITE_PREFIX` 是用于 markdown-it-eleventy-img 这个插件，重写 图片路径的， `pathprefix` 是eleventy 的一个参数，用于定义路由根路径， 它会影响 njk 模板中的url 变量。 
如果不单独定义 `SITE_PREFIX` 这个变量，那么图片在 dev 环境可以预览， 但是生产环境下，路径就是错的，需要加一个前缀。 

注意： 资源引用路劲中不要使用中文字符，很可能会解析错误！


如果你需要支持 Giscus 评论系统， 你需要修改 _includes/post.njk 中的 
```
{# giscus 评论系统 #}
<script src="https://giscus.app/client.js"
        data-repo="joisun/blog_11ty"
        data-repo-id="xxxx"
        data-category="General"
        data-category-id="xxxx"
        data-mapping="pathname"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="noborder_light"
        data-lang="zh-CN"
        crossorigin="anonymous"
        async>
</script>
```

为你自己的 giscus [文档](https://giscus.app/zh-CN)
