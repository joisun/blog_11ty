---
title: LightHouse优化
date: 2022-03-19
tags:
  - performance
---

CSS 文件是渲染阻塞资源：它们必须在浏览器渲染页面之前加载和处理。包含不必要的大样式的网页需要更长的渲染时间。

本文将利用lighthouse，以优化[关键渲染路径](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/)和改善 [First Contentful Paint (FCP)](https://web.dev/fcp/) 为目标来延迟加载非关键 CSS。

### 测量

在[页面](https://defer-css-unoptimized.glitch.me/)上运行 [Lighthouse](https://web.dev/discover-performance-opportunities-with-lighthouse/#run-lighthouse-from-chrome-devtools) 并转到 **Performance** 部分。

报告显示了值为“1s”的 **First Contentful Paint** 指标，以及**消除渲染阻塞资源**的机会，结果指向 **style.css** 文件：

![未经优化的网页的 Lighthouse 报告，显示“1s”的 FCP 并在“Opportunities”下显示“消除阻塞资源”](https://web-dev.imgix.net/image/admin/eZtuQ2IwL3Mtnmz09bmp.png?auto=format)

要可视化此 CSS 如何阻塞渲染：

1. 在 Chrome 中打开[页面](https://defer-css-unoptimized.glitch.me/)。1. Press `Control+Shift+J` (or `Command+Option+J` on Mac) to open DevTools.
2. Click the **Performance** tab.
3. 在 Performance 面板中，单击 **Reload**。

在生成的跟踪中，您将看到在 CSS 完成加载后会立即放置 **FCP** 标记：

![未经优化页面的 DevTools 性能跟踪，显示 FCP 在 CSS 加载后启动。](https://web-dev.imgix.net/image/admin/WhpaDYb98Rf03JmuPenp.png?auto=format)

这意味着浏览器需要等待所有 CSS 加载完毕并得到处理，之后才能在屏幕上绘制单个像素。

### 优化

要优化此页面，您需要知道哪些类被视为“关键”类。为此，您将使用[Coverage Tool：](https://developer.chrome.com/docs/devtools/css/reference/#coverage)

1. 在 DevTools 中，按下 `Control+Shift+P` 或`Command+Shift+P` (Mac) 打开[命令菜单](https://developers.google.com/web/tools/chrome-devtools/command-menu)。
2. 输入“Coverage”并选择 **Show Coverage** 。
3. 单击 **Reload** 按钮，重新加载页面并开始捕获覆盖范围。

![CSS 文件的覆盖范围，显示未使用的字节占 55.9%。](https://web-dev.imgix.net/image/admin/JTFK7wjhlTzd2cCfkpps.png?auto=format)

双击报告，查看以两种颜色标记的类：

- 绿色（**关键**）：这些是浏览器渲染可见内容（如标题、副标题和可折叠项按钮）所需的类。
- 红色（**非关键**）：这些样式应用于非立即可见的内容（如可折叠项内的段落）。

利用此信息优化 CSS，使浏览器在页面加载后立即开始处理关键样式，同时延迟加载非关键 CSS：

- 在从覆盖工具获取的报告中提取标记了绿色的类定义，然后将这些类放在页面标题的 `<style>` 块内：

```html
<style type="text/css">
  .accordion-btn {
    background-color: #add8e6;
    color: #444;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 15px;
    transition: 0.4s;
  }
  .container {
    padding: 0 18px;
    display: none;
    background-color: white;
    overflow: hidden;
  }
  h1 {
    word-spacing: 5px;
    color: blue;
    font-weight: bold;
    text-align: center;
  }
</style>

```

- 然后，应用以下模式，异步加载其余类：

```html
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="styles.css" /></noscript>

```

这不是加载 CSS 的标准方式。以下是工作原理：

- `link rel="preload" as="style"` 异步请求样式表。您可以在[预加载关键资产指南](https://web.dev/preload-critical-assets)中了解有关 `preload` 的更多信息。
- `link` 的 `onload` 属性允许在加载 CSS 完成后对其进行处理。
- 在使用 `onload` 处理程序后将其“归零”有助于某些浏览器避免在切换 rel 属性时重新调用处理程序。
- 对 `noscript` 元素内的样式表的引用可作为不执行 JavaScript 的浏览器的后备。

### 监视

使用 DevTools 在[优化页面](https://defer-css-optimized.glitch.me/)上运行另一个 **Performance** 跟踪。

**FCP** 标记出现在页面请求 CSS 之前，这意味着浏览器在渲染页面之前不需要等待 CSS 加载：

![未经优化页面的 DevTools 性能跟踪，显示 FCP 在 CSS 加载前启动。](https://web-dev.imgix.net/image/admin/0mVq3q760y37JSn2MmCP.png?auto=format)

最后一步，在优化后的页面上运行 Lighthouse。

在报告中，您将看到 FCP 页面减少了 **0.2s**（改善了 20%！）：

> 文章来源：https://web.dev/defer-non-critical-css/

## 工具概览 [#](https://web.dev/extract-critical-css/#)

有许多出色的工具可以自动确定页面的关键 CSS。这是个好消息，因为手动执行此操作会相当乏味。它需要分析整个 DOM 以确定视区中应用的每个元素的样式。

### Critical [#](https://web.dev/extract-critical-css/#critical)

[Critical](https://github.com/addyosmani/critical) 可提取、缩小和内联首部 CSS，可作为[npm 模块使用](https://www.npmjs.com/package/critical)。它可以与 Gulp（直接）或 Grunt（作为[插件](https://github.com/bezoerb/grunt-critical)）一起使用，并且还有一个 [webpack 插件](https://github.com/anthonygore/html-critical-webpack-plugin)。

这是个简单的工具，会在处理时进行大量思考。您甚至不必指定样式表，Critical 会自动检测它们。它还支持为多个屏幕分辨率提取关键 CSS。

### criticalCSS [#](https://web.dev/extract-critical-css/#criticalcss)

[CriticalCSS](https://github.com/filamentgroup/criticalCSS) 是另一个可以提取首屏 CSS的[npm 模块](https://www.npmjs.com/package/criticalcss)。它也可用于 CLI。

它没有内联和缩小关键 CSS 的选项，但它允许您强制包含实际上不属于关键 CSS 的规则，并提供了对包含 `@font-face` 声明的更精细的控制。

### Penthouse [#](https://web.dev/extract-critical-css/#penthouse)

如果您的站点或应用程序具有大量的样式或动态注入 DOM 的样式（在 Angular 应用程序中很常见），那么 [Penthouse](https://github.com/pocketjoso/penthouse) 是一个不错的选择。它使用 [Puppeteer](https://github.com/GoogleChrome/puppeteer)，还提供[在线版本](https://jonassebastianohlsson.com/criticalpathcssgenerator/)。

Penthouse 不会自动检测样式表，您必须指定要为其生成关键 CSS 的 HTML 和 CSS 文件。好处是它擅长并行处理多个作业。

> 来源：https://web.dev/extract-critical-css/
