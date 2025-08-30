---
title: 微前端架构下的js隔离原理
date: 2025-08-19
tags:
  - post
---

## 沙箱隔离

微前端场景下
```
好的，我们来深入浅出地解释清楚微前端中的 JavaScript 隔离，以及 JS 沙箱机制的原理。

### 一、为什么需要 JS 隔离？（问题的根源）

想象一下，你正在搭建一个大型网站（主应用），里面集成了来自不同团队开发的多个功能模块（微应用），比如一个“用户中心”模块和一个“商品评论”模块。

如果在没有隔离的情况下，这两个微应用的代码会同时运行在同一个全局环境（`window` 对象）下。这会立刻引发一系列灾难性的问题：

1.  **全局变量冲突**：
    *   用户中心定义了 `window.user = { id: 1, name: 'Alice' }`。
    *   商品评论为了方便，也定义了 `window.user = 'Bob's review'`。
    *   **结果**：后加载的应用会覆盖先加载的应用的全局变量，导致前者功能异常。

2.  **全局事件监听冲突**：
    *   两个微应用都监听了 `window.onpopstate` 事件来处理浏览器路由变化。
    *   **结果**：同样是后者覆盖前者，导致只有一个应用的路由能正常工作。

3.  **定时器冲突**：
    *   一个应用设置了 `window.setInterval`，但因为代码逻辑问题没有在卸载时用 `clearInterval` 清除。
    *   **结果**：当你切换到其他应用时，这个定时器还在后台运行，造成内存泄漏和意外的逻辑执行。

4.  **第三方库版本冲突**：
    *   主应用使用了 Vue 2。
    *   某个微应用使用了 Vue 3。
    *   **结果**：两者都依赖全局的 `Vue` 对象，版本不兼容会导致其中一个或两者都无法运行。

**核心问题**：所有微应用共享同一个 `window` 对象，导致命名空间污染和环境状态的不可预测性。

**解决方案**：为每个微应用创建一个“沙箱”（Sandbox），让它们的代码在这个受控的环境里运行，就像孩子们在各自的沙盘里玩沙子，互不干扰。

---

### 二、JS 沙箱的核心目标是什么？

JS 沙箱的核心目标是：

1.  **隔离**：确保微应用在运行时对全局 `window` 对象的修改（如添加变量、修改属性、设置定时器）被隔离在自己的沙箱内部，不会影响到主应用和其他微应用。
2.  **干净的环境**：确保微应用在每次进入时都能获得一个“纯净”的、符合其预期的全局环境，而在退出时，它对全局环境造成的所有“污染”都会被清理干净。
3.  **通信**：在隔离的同时，也需要保留与主应用通信的能力（例如，获取主应用传递的数据）。

---

### 三、JS 沙箱是如何实现的？（三大主流方案）

实现 JS 沙箱主要有三种技术路线，从简单到复杂，各有优劣。

#### 方案一：快照沙箱 (Snapshot Sandbox)

这是最早期、最简单的实现方式，原理非常直观。

*   **原理**：利用“拍照”和“恢复”的思想。
*   **如何工作**：
    1.  **激活 (Activate)**：在微应用加载之前，给当前的全局 `window` 对象拍一张“快照”（Snapshot），即遍历 `window` 上的所有属性并存入一个对象中。
    2.  **运行**：让微应用正常运行。此时，它可能会修改 `window`，比如 `window.myVar = 123`。
    3.  **失活 (Deactivate)**：在微应用卸载时，再次遍历当前的 `window` 对象，与之前拍的“快照”进行对比（Diff）。
        *   如果某个属性在快照里有，但现在的值变了，就把它**恢复**成快照里的旧值。
        *   如果某个属性是微应用新增的（快照里没有），就把它**删除**掉。

*   **代码示意**：

    ```javascript
    class SnapshotSandbox {
        constructor() {
            this.proxy = window;
            this.snapshot = {};
            this.modifyProps = {}; // 记录被修改的属性
        }
    
        activate() {
            // 1. 拍快照
            this.snapshot = {};
            for (const prop in window) {
                if (window.hasOwnProperty(prop)) {
                    this.snapshot[prop] = window[prop];
                }
            }
            // 恢复上次被修改的属性
            Object.keys(this.modifyProps).forEach(prop => {
                window[prop] = this.modifyProps[prop];
            });
        }
    
        deactivate() {
            // 2. 对比和恢复
            for (const prop in window) {
                if (window.hasOwnProperty(prop)) {
                    if (this.snapshot[prop] !== window[prop]) {
                        // 记录修改，并恢复
                        this.modifyProps[prop] = window[prop];
                        window[prop] = this.snapshot[prop];
                    }
                }
            }
        }
    }
    ```

*   **优点**：
    *   实现简单，兼容性好。
*   **致命缺点**：
    *   **无法同时运行多个微应用实例**。因为只有一个全局 `window`，恢复操作会破坏其他正在运行的微应用的环境。因此，它只适用于“单实例”模式。
    *   性能开销大，因为需要遍历和对比整个 `window` 对象。

#### 方案二：代理沙箱 (Proxy Sandbox) - 【现代主流方案】

为了解决快照沙箱无法支持多实例的问题，业界引入了 ES6 的 `Proxy` 特性，实现了更强大、更高效的沙箱。这是 `qiankun` 等现代微前端框架的核心。

*   **原理**：创建一个“假的” `window` 对象（代理对象），把这个假对象作为微应用运行时的全局作用域。所有对全局变量的读写操作都会被这个代理拦截。

*   **如何工作**：
    1.  **创建代理**：为每个微应用创建一个独立的 `fakeWindow` 对象（一个空对象 `{}`）。然后使用 `new Proxy(fakeWindow, handlers)` 创建一个代理。
    2.  **拦截操作 (Handlers)**：
        *   **`set(target, prop, value)` 拦截**：当微应用试图执行 `window.myVar = 123` 时，`Proxy` 的 `set` 陷阱会捕获这个操作。它不会去修改真实的 `window`，而是将 `myVar: 123` **设置在 `fakeWindow` 上**。
        *   **`get(target, prop)` 拦截**：当微应用试图读取 `window.location` 时，`Proxy` 的 `get` 陷阱会捕获这个操作。
            *   它会先检查 `fakeWindow` 上有没有这个属性。如果有（比如之前设置的 `myVar`），就返回 `fakeWindow` 上的值。
            *   如果 `fakeWindow` 上没有（比如 `document`、`location` 等原生全局对象），它就会去**真实的 `window` 对象上读取**并返回。

*   **代码示意**：

    ```javascript
    class ProxySandbox {
        constructor() {
            const fakeWindow = {};
            const realWindow = window;
    
            this.proxy = new Proxy(fakeWindow, {
                // 拦截设置操作
                set(target, prop, value) {
                    // 赋值操作只在 fakeWindow 上生效
                    target[prop] = value;
                    return true;
                },
                
                // 拦截读取操作
                get(target, prop) {
                    // 优先从 fakeWindow 中取值
                    if (prop in target) {
                        return target[prop];
                    }
                    // fakeWindow 中没有，则从真实 window 中取值
                    const value = realWindow[prop];
                    // 对函数绑定正确的 this 上下文
                    if (typeof value === 'function') {
                        return value.bind(realWindow);
                    }
                    return value;
                }
            });
        }
    }
    
    // 使用
    const sandbox1 = new ProxySandbox();
    const sandbox2 = new ProxySandbox();
    
    // 假设在沙箱1的环境中执行代码
    // (function(window){
    //   window.myVar = 'App1';
    //   console.log(window.myVar); // 输出 'App1'
    //   console.log(window.document); // 正常访问真实 document
    // })(sandbox1.proxy);
    
    // 假设在沙箱2的环境中执行代码
    // (function(window){
    //   window.myVar = 'App2';
    //   console.log(window.myVar); // 输出 'App2'
    // })(sandbox2.proxy);
    
    console.log(window.myVar); // 输出 undefined，真实 window 未被污染
    ```

*   **优点**：
    *   **完美支持多实例同时运行**，因为每个微应用都有自己独立的 `fakeWindow`，互不影响。
    *   性能比快照沙箱好得多，因为它只在读写操作时才触发拦截，而不是遍历整个 `window`。
*   **缺点**：
    *   依赖 ES6 `Proxy`，对浏览器版本有一定要求（不过现代浏览器都已支持）。

#### 方案三：iframe 沙箱

`iframe` 是浏览器原生提供的最强大的沙箱。每个 `iframe` 都有一个完全独立的 `window`、`document` 和 `history` 对象，提供了近乎完美的隔离。

*   **原理**：将每个微应用都运行在一个独立的 `iframe` 中。
*   **优点**：
    *   **隔离性最强**：天然的 JS、CSS 隔离，不存在任何冲突风险。
    *   实现简单，直接把微应用的 URL 填入 `iframe` 的 `src` 即可。
*   **缺点**：
    *   **体验和通信问题**：
        *   **URL 不同步**：`iframe` 的 URL 变化不会反映在浏览器主地址栏上，反之亦然，路由管理复杂。
        *   **UI 不融合**：`iframe` 内部的弹窗（`alert`, `modal`）会被限制在 `iframe` 区域内，无法覆盖整个页面。页面滚动条也会出现主次之分，体验割裂。
        *   **通信复杂**：主子应用通信需要依赖 `postMessage` API，比较繁琐。
    *   **性能和内存开销大**：每个 `iframe` 都是一个完整的、独立的网页环境，创建和销毁的成本很高。

> **注**：一些新的框架如 `wujie` 采用了“`iframe` + Web Component` 的混合方案，巧妙地利用 `iframe` 作为纯粹的 JS 沙箱来运行代码，但把渲染（DOM）操作劫持到主应用的 Web Component 中，从而解决了 `iframe` 的 UI 体验问题，是一种创新的思路。

### 总结

| 特性 | 快照沙箱 (Snapshot) | 代理沙箱 (Proxy) | iframe 沙箱 |
| :--- | :--- | :--- | :--- |
| **隔离级别** | 弱 | **强** | 完美 |
| **多实例支持**| 不支持 | **支持** | 支持 |
| **性能开销** | 高（遍历对比） | **低**（按需拦截）| 非常高（完整页面）|
| **实现复杂度** | 简单 | 中等 | 简单（但应用体验改造复杂）|
| **适用场景** | 旧版或单实例场景 | **现代微前端框架首选** | 对隔离性要求极高，且能接受体验和性能牺牲的场景|

**一句话总结**：现代微前端框架（如 `qiankun`）的 JS 隔离，主要依赖 **Proxy 沙箱**机制。它为每个微应用创建一个代理 `window`，通过拦截读写操作，将所有修改限制在应用自己的作用域内，同时又能访问到真实的全局对象，从而在实现强隔离的同时，保证了性能和多实例共存的能力。
```



```
您提出的问题非常棒，一针见血地指出了**快照沙箱（Snapshot Sandbox）的一个核心局限性和设计上的“妥协”**。

您完全正确。**快照沙箱并不是深拷贝，它确实无法隔离对 `window` 上已有对象（如 `document`, `location`）内部属性的修改。**

我们来详细拆解一下这个问题。

### 一、您观察到的问题是绝对正确的

我们用您举的 `window.document` 的例子来分析：

1.  **沙箱激活前**：
    *   `window.document` 指向浏览器提供的原生 `document` 对象。
    *   快照沙箱开始工作，它创建了一个 `snapshot` 对象。
    *   执行 `snapshot.document = window.document;`。此时，`snapshot.document` 和 `window.document` 存储的是**同一个内存地址**，它们都指向那个唯一的 `document` 对象。

2.  **微应用 A 运行中**：
    *   微应用 A 执行了代码：`window.document.title = 'App A's Title';`
    *   这个操作修改的是那个**唯一 `document` 对象**的 `title` 属性。

3.  **沙箱失活时**：
    *   沙箱开始恢复环境，它会遍历 `window` 的属性。
    *   当检查到 `document` 属性时，它会做比较：`window.document === snapshot.document`。
    *   因为两者仍然指向同一个对象，这个比较的结果是 `true`。
    *   **快照沙箱会认为 `window.document` 这个“引用”本身没有被改变**，因此它不会做任何恢复操作。
    *   **结果**：`document` 对象的 `title` 属性已经被永久性地修改了，这个“污染”泄露到了全局，无法被快照沙箱清理。

**结论：** 快照沙箱只能处理以下几种情况的隔离：

*   **新增全局变量**：`window.myVar = 1;` -> 卸载时可以 `delete window.myVar;`。
*   **修改全局变量（值类型）**：`window.name = 'appA';` -> 卸载时可以恢复 `window.name` 的旧值。
*   **修改全局变量（引用类型，即整个对象被替换）**：`window.myConfig = {a: 1};` -> 卸载时可以把 `window.myConfig` 恢复为之前的对象引用。

它**无法处理**对已有全局对象**内部属性**的修改，例如：
*   `document.body.appendChild(...)`
*   `location.hash = '...` (虽然 location 对象的行为更复杂)
*   `window.onpopstate = () => {}` (虽然 `onpopstate` 经常是整个替换，但如果是 `addEventListener` 就无法追踪了)

### 二、那为什么快照沙箱还存在？它解决了什么？

既然有这么大的缺陷，为什么它会被设计出来并使用过一段时间呢？

1.  **历史局限性**：在没有 `Proxy` 的年代（IE 浏览器），这是用纯 JavaScript 实现隔离的一种简单且兼容性好的尝试。
2.  **解决了“最常见”的问题**：在很多简单场景下，微应用最常见的污染是**定义新的全局变量**，比如 `window.axios`、`window.myApp` 等。快照沙箱对这类问题是有效的。
3.  **单实例模式的妥协**：快照沙箱的设计理念是“一次只有一个微应用在运行”。在这种模式下，虽然 `document` 被修改了，但下一个微应用加载时，它可能又会根据自己的逻辑去修改 `document`，覆盖掉上一个应用的影响。这是一种非常脆弱的平衡，但勉强能用。

**所以，您的理解是完全正确的：快照沙箱是一种“不彻底”的沙箱，它提供的隔离能力非常有限，存在明显的“逃逸”漏洞。**

### 三、这个问题如何引出 Proxy 沙箱的优越性

您提出的这个痛点，恰恰是 **Proxy 沙箱** 要解决的核心问题。我们再来看看 Proxy 是如何应对的：

*   微应用拿到的不是真实的 `window`，而是一个 `proxy` 对象。
*   当微应用执行 `window.document.title = 'App A'` 时，实际发生了什么？
    1.  代码尝试访问 `window.document`。
    2.  `Proxy` 的 `get` 陷阱被触发，要获取 `document` 属性。
    3.  `Proxy` 内部的 `fakeWindow` 上没有 `document`，于是它会去真实的 `window` 上获取 `document` 对象并返回。
    4.  然后代码尝试给返回的 `document` 对象的 `title` 属性赋值。
    5.  **注意！** 这一步是直接操作真实的 `document` 对象，`Proxy` **默认情况下是无法拦截**对 `window` 子对象属性的修改的！

**啊哈，看起来 Proxy 也有同样的问题？**

不完全是。现代微前端框架如 `qiankun` 对 Proxy 沙箱做了进一步增强，以处理 `document` 等特殊对象。

`qiankun` 的 `ProxySandbox` 实际上会做一些“魔改”：

1.  **对 `document` 的特殊处理**：当微应用通过代理访问 `document` 时，`qiankun` 不会直接返回原生的 `document`。它会返回一个**被代理过的 `document` 对象**，或者通过其他方式（如重写 `document.querySelector`、`document.body.appendChild` 等关键方法）来劫持 DOM 操作。
2.  **事件监听的劫持**：`qiankun` 会重写 `window.addEventListener` 和 `window.removeEventListener`。当微应用调用它们时，`qiankun` 会记录下这个应用注册了哪些事件。在应用卸载时，它会根据记录自动调用 `removeEventListener` 来清理事件，防止内存泄漏和逻辑冲突。

**总结一下：**

1.  您对快照沙箱的质疑**完全正确**，它的浅拷贝机制无法隔离对 `window` 上已有对象内部的修改，是一种非常初级和有缺陷的隔离方案。
2.  这个缺陷正是推动技术向 **Proxy 沙箱** 演进的关键原因。
3.  即使是基础的 Proxy 沙箱，也需要对 `document`、`addEventListener` 等关键全局 API 做**额外的劫持和处理**，才能实现更彻底的隔离，尤其是在 DOM 和事件层面。这使得现代微前端框架的沙箱实现比我们之前讨论的简化版模型要复杂得多。

感谢您提出这么有深度的问题，这让我们能够更深入地探讨沙箱技术的细节和演进过程！
```

