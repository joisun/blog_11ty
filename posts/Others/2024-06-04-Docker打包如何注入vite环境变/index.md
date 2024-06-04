---
title: Docker打包如何注入vite环境变
date: 2024-06-04
tags:
  - post
---



## 遇到的问题

最近优化修改了下 [resume-online](https://github.com/jaycethanks/resume-online) 这个小项目， 是通过docker-compose 一键部署的。 遇到个问题，想来有些朋友肯定遇到过。 写出来分享下。 

我们知道， 在vue3 中，vite 允许我们在 `.env` 文件中定义以 `VITE_` 开头的环境变量， 然后在运行时环境下，我们就可以通过 `import.meta.env.VITE_XXX` 去访问使用这个变量。 vite 在我们运行 `build` 打包命令的时候也会帮我们处理环境变量文件，将他们转为静态值插入到我们的代码中。这么做的目的是我们可以在运行时也可以访问到环境变量了。 

我想要将一些环境变量在打包之前定义在 docker-compose.yml 文件中，这样以来，我们想要修改这些变量的时候，就会很方便。 于是我是这么做的。

1. 在 docker-compose.yml 文件中通过 args 选项注入环境变量

```yml
#......
services:
  resume-web:
    container_name: 'resume-web'
    restart: always
    build:
      context: ./web/
      dockerfile: Dockerfile
      args:
        - VITE_ADMIN_PASSWD=1234  # 构建阶段注入环境变
    ports:
      - 83:80
    depends_on:
      - resume-server
    networks:
      - online-resume
#......      
```

2. 在 Dockerfile 文件中接收并定义 node 的环境变量

```dockerfile
# 设置环境变量
ARG VITE_ADMIN_PASSWD
ENV VITE_ADMIN_PASSWD=$VITE_ADMIN_PASSWD
```

这时候会发现我们在运行时是拿不到 `import.meta.env.VITE_ADMIN_PASSWD` 这个变量的。  



## 具体问题

为什么我们拿不到这个变量呢？ 其实是因为我们在 Dockerfile 中写入的环境变量是 node 的环境变量。 我们可以通过 `process.env.VITE_ADMIN_PASSWD` 访问到。不过我们在运行时是访问不到这个环境变量的。 

那么问题其实在于，用什么方式将这个node环境变量，传给 Vite 处理，然后我们可以通过  `import.meta.env.VITE_ADMIN_PASSWD` 这种方式在运行时访问到。



## Vite 的 define 配置项

Vite 提供了一个全局变量定义的配置项 —— [#define](https://vitejs.dev/config/shared-options.html#define). 它使用  [esbuild define](https://esbuild.github.io/api/#define) 来进行替换, 它同样在build的时候会被静态的替换。 

文档中也给出了示例：
```ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

我们借由这个能力，实际可以如下定义：

```js
......
export default defineConfig(({ command, mode }) => ({
  base: './',
  plugins: [vue(), vueJsx()],
  define: command === 'build' ? {
    'import.meta.env.VITE_ADMIN_PASSWD': process.env.VITE_ADMIN_PASSWD,
    'import.meta.env.VITE_PASSWD': process.env.VITE_PASSWD,
    'import.meta.env.VITE_PASSINPUTPAGE_BG': process.env.VITE_PASSINPUTPAGE_BG,
    'import.meta.env.VITE_PASSWD_INPUT_LABEL': process.env.VITE_PASSWD_INPUT_LABEL,
    'import.meta.env.VITE_SUCCESS_TITLE': process.env.VITE_SUCCESS_TITLE,
    'import.meta.env.VITE_SUCCESS_CONTENT': process.env.VITE_SUCCESS_CONTENT,
    'import.meta.env.VITE_ERROR_TITLE': process.env.VITE_ERROR_TITLE,
    'import.meta.env.VITE_ERROR_CONTENT': process.env.VITE_ERROR_CONTENT,
  } : {},
  resolve: {
  ......
```

这样，就可以将node环境变量传递给 Vite 了， 它将定义全局的常量。  然后我们就可以在运行时中正常使用了。

不过有一点需要注意，在运行时中访问这些环境变量的时候，应该使用解构。 否则可能会将字符串解析为变量。 

例如：

```js
// 假设 VITE_ADMIN_PASSWD 的值为 jayce
if(!import.meta.env.VITE_ADMIN_PASSWD) {
......
}
//这段代码会被解析为：
if(!jayce) {// jayce 并不是变量
......
}
```

应该这样去使用：

```js
 const { VITE_ADMIN_PASSWD } = import.meta.env
  if (!VITE_ADMIN_PASSWD) {
}
```



这种方案算是比较能方便的解决问题，但是显然它并不是最佳方案。还有一些其他的方案，思路都是差不多的，例如可以在 Vite 进行打包之前，通过shell 脚本将我们传递的值添加到 `.env` 文件。 

我这里是觉得这样更简单一些。 



