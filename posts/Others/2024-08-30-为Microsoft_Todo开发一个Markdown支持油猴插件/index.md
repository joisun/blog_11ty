---
title: 为Microsoft Todo开发一个Markdown支持油猴插件
date: 2024-08-30
tags:
  - Tampermonkey
  - Markdown
  - 浏览器插件
---





## 引言

我是 Microsoft ToDo 的重度依赖用户， 基本上是把它当作一个笔记应用来使用的，收集收集面试题啊，或者零碎的知识点之类的。 不过它有一点很遗憾，那就是不支持 Markdown, 早都有人反应过这个问题，也不知道为什么直径不支持。 我觉得很大原因还是产品的定位不同吧。 Todo 应用本身就不需要过于繁杂的文本描述。 

为什么不适用 Notion 呢 ？ Notion 确实很强大，功能也非常丰富。 不过也正是它太过于强大，我觉得有点杀鸡用牛刀的感觉。 相比之下，我更喜欢轻量，功能专一，有 Microsoft 背景支持下的 Todo。

考虑到我们需要在不修改Microsoft ToDo原始代码的情况下注入新功能，油猴插件成为了一个理想的选择。油猴插件允许我们将自定义JavaScript代码注入到网页中，这为我们提供了极大的灵活性。此外不需要像 Google Extension 一样需要严格的发布审核流程。

那么就来看看怎么实现这个小插件吧。

## Setup

本次开发我们使用 Vite + [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) 插件来开发，感谢插件作者 

```bash
pnpm create monkey
```

基本配置：
```ts
//...
export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Microsoft To-Do Markdown Preview Support - mstodo-md-preview',
        author: 'Zhongyi Sun',
        namespace:'https://github.com/joisun',
        description: 'Microsoft To-Do Markdown Preview Support',
        icon: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://to-do.live.com/&size=64',
        match: ['https://to-do.live.com/*'],
        license: 'MIT',
        version: pack.version,
      },
//...        
```





## 基本思路

我们要做的事情似乎很简单，也很单一， 那就是:

1. 不影响现有文本的情况下把内容预览为 Markdown
2. 支持动态的解析用户输入
3. 受限于页面元素大小， 我们需要支持用户自定义的切换展示模式
4. 在切换其他 todo item 的时候，我们需要更新预览内容。 

对于Markdown解析，我们选择了广受欢迎的markdown-it库。这个库不仅性能优秀，还提供了丰富的扩展选项，使我们未来能够根据需求自由的自定义Markdown的渲染行为。

为了让代码块更加美观，我们还需要代码块的语法高亮， 对此，我们选用 highlight.js 来实现。

## 深入代码实现

让我们从代码层面深入了解这个插件是如何工作的。

首先，我们需要设置基础结构：

```javascript
import { behindDebounce } from "./debounce";
import { waitForElement } from "./getElement";
import markdownit from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/tokyo-night-dark.min.css";
import "./style.css";
```

这些导入语句不仅引入了核心的markdown-it和highlight.js库，还包括了一些自定义的工具函数。`behindDebounce`函数用于性能优化，而`waitForElement`函数则是为了确保我们的代码在正确的DOM元素出现后才执行。

`waitForElement`函数的实现，我们使用 MutationObserver 来实现，返回一个Promise：

```typescript
export function waitForElement(selector: string) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}
```

这个函数利用了Promise和MutationObserver API。它会持续监视DOM的变化，直到指定的元素出现。

为什么不直接在 `document.onload` 钩子中去获取元素呢？

答案是，获取不到。像Microsoft ToDo这样的单页应用，DOM元素可能不会立即可用，所以我们需要监听元素出现了我们再获取。当然我们也可以用一个循环方法不断去判断。 

接下来，我们配置markdown-it解析器：

```javascript
const md = markdownit({
  html: false,
  xhtmlOut: false,
  breaks: false,
  langPrefix: "language-",
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return "";
  },
});
```

这个配置禁用了HTML标签支持以增强安全性，启用了URL自动链接和排版美化功能。特别值得注意的是highlight函数，它集成了highlight.js，为代码块提供语法高亮功能。

为了使插件能够和ToDo的界面无缝集成，我们需要创建一些自定义的UI元素：

```javascript
const initBtns = () => {
  if (document.getElementById("mstodo:btns")) return;
  const detailNote = document.querySelector(".detailNote") as HTMLDivElement;
  if (!detailNote) return;

  const edit = createBtnWithIcon(
    EDIT_BTN_ID,
    `<svg ...</svg>`
  );
  const view = createBtnWithIcon(
    VIEW_BTN_ID,
    `<svg ...</svg>`
  );
  const btns = document.createElement("div");
  btns.id = "mstodo:btns";
  btns.style.display = "flex";
  btns.style.gap = ".5em";
  btns.style.justifyContent = "flex-end";
  btns.style.padding = "0.5em 1em";

  btns.appendChild(edit);
  btns.appendChild(view);
  detailNote.parentElement &&
    detailNote.parentElement?.insertBefore(btns, detailNote);
  edit.addEventListener("click", () => {
    showEditor();
  });
  view.addEventListener("click", () => {
    isEdit = false;
    hideEditor();
  });
};
```

这个函数创建了编辑和预览按钮，并将它们插入到ToDo的界面中。通过这些按钮，用户可以在编辑Markdown文本和查看渲染结果之间自由切换。

插件的核心功能是动态渲染Markdown。这部分的实现依赖于MutationObserver API 和点击事件：

```javascript
const observerHandler = behindDebounce(function () {
  const qlEditor = document.querySelector(".ql-editor") as HTMLDivElement;
  console.log("mstodo:editor existed: ", !!qlEditor);

  const mdViewer =
    document.getElementById("tstodo:mdViewer") ||
    (createContainer(qlEditor) as HTMLDivElement);

  console.log("mstodo:mdviewer existed: ", !!mdViewer);

  initBtns();
  if (!qlEditor) return;
  const mdContent = qlEditor.innerText;
  try {
    console.log("mstodo:parsing....");
    let result = md.render(mdContent);
    mdViewer.innerHTML = result;

    if (!isEdit) hideEditor();
  } catch (err) {
    console.error(err);
  }
}, 100);

const observer = new MutationObserver(observerHandler);
function observe() {
  observer.observe(document.querySelector(".ql-editor")!, {
    characterData: true,
    childList: true,
    subtree: true,
    characterDataOldValue: true
  });
}
```

这段代码创建了一个MutationObserver，通过开启 `characterData` 来监听编辑器内容的变化。每当内容发生变化时，它就会触发Markdown的重新渲染。注意到我们使用了`behindDebounce`函数来包装处理函数，这是为了避免在用户快速输入时触发过于频繁的渲染，从而提高性能。

为了处理用户的直接交互，我们还实现了点击监听：

```javascript
function clickListen() {
  document.addEventListener("click", function (e) {
    const target = e.target as HTMLButtonElement;
    const parent = document.querySelector('.tasks') || document.querySelector('.grid-body')
    if (target.className === "taskItem-titleWrapper" || parent?.contains(target)) {
      console.log("mstodo: click listener triggered")
      observerHandler();
    }
  });
}
```

这个函数确保了在用户切换不同的任务项时能够正确更新Markdown渲染。

整个插件的初始化过程如下：

```javascript
waitForElement(".ql-editor").then(() => {
  observerHandler();
  hideEditor();
  observe();
  clickListen();
});
```

这里我们用到了前面提到的`waitForElement`函数，确保在编辑器元素加载完成后才开始初始化插件。

通过这种方式，我们成功地为Microsoft ToDo添加了Markdown支持，而不需要修改ToDo的原始代码。用户现在可以在任务描述中使用Markdown语法，并实时预览渲染效果。

这个小插件展示了油猴插件的强大功能，也体现了前端开发中解决实际问题的创新思路。通过合理利用现代Web API如MutationObserver，结合成熟的开源库如markdown-it和highlight.js，我们能够相对简单地实现复杂的功能。

让我们来看看效果吧：

https://greasyfork.org/zh-CN/scripts/505577-microsoft-to-do-markdown-preview-support-mstodo-md-preview



源码在这里 [here](https://github.com/joisun/mstodo-md-preview)





## More

我之前写过一些小插件工具，也乘这个机会推荐给需要的朋友。 

- [标题显著,标识等级标题](https://greasyfork.org/zh-CN/scripts/447204-%E6%A0%87%E9%A2%98%E6%98%BE%E8%91%97-%E6%A0%87%E8%AF%86%E7%AD%89%E7%BA%A7%E6%A0%87%E9%A2%98): 用于解决有些网站文章太长，或者样式不明显导致分不清楚等级标题
- [github-dark-optimization](https://greasyfork.org/zh-CN/scripts/475441-github-dark-optimization): Github 暗色模式样式优化
- [gnmdcsdn](https://greasyfork.org/zh-CN/scripts/498074-gnmdcsdn) : CSDN 超极简模式， 懂得都懂

还有一些就不过多展开了， 有兴趣可以看这里 [here](https://greasyfork.org/zh-CN/users/930220-joisun)。
