---
title: Web Workers API
date: 2023-05-01
tags:
  - post
---

**Web Workers ** 使得 web 应用 从主线程分离出一个后台进程去执行脚本操作成为可能。 这样做的好处是，能够将耗时的处理放在另一个分线程， 这样的话，主线程(通常是UI 线程)就不会因为复杂脚本的执行，而被阻塞。

### Web Workers 的概念和使用

一个 worker 是通过使用一个构造器创建（eg. `Worker()`），它可以运行一个已经命名的 JavaScript 文件 —— 文件中的代码将会在一个 worker 线程中去执行。

除了 标准 的 JavaScript 提供的一系列方法，（如, String, Array, Object, JSON. etc）你还可以在一个 worker 线程中执行几乎所有代码。 但是也有一些例外， 例如，你不能在 worker 中直接操作 DOM， 也不能使用一些 由 window对象提供的方法和属性。 对于有哪些代码可以在worker 中执行，可以看下方的 [worker global context and functions](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#worker_global_contexts_and_functions) 和 [supported web APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#supported_web_apis) 。

workers 和 主线程 的数据传输，通过 系统的 消息机制实现（system of messages）—— 两遍都通过

- `postMessage()` 方法 发送消息
- `onmessage` 事件 handler 响应 消息。

（信息则被包含在 Message 事件的 `data` 属性中 ），且数据是被 copied 而不是 shared 。

Workers 也可以在内部创建新的 workers， 只要这些 workers 在同一个父页面创建。 此外，workers 也可以使用 `XMLHttpRequest` 来操作网络 I/O, 除了一些例外情况， `XMLHttpRequest` 对象上的 `reponseXML` 和 `channel` 属性总返回 `null` 。

### Worker 类型

workers 也有很多不同的类型：

- Dedicated#专注 workers : 是被单个脚本所利用的 workers. 它的上下文是由 [`DedicatedWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope) 对象所表示。
- [`Shared workers`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) : 能够被多个 windows 中执行的脚本所公用的 workers
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) : 本质表现是一个建立在多个web 应用，浏览器以及网络 (when available) 之间的代理服务器 (proxy server)。 它旨在提供一个有效的离线体验，拦截网络请求，并根据网络是否可用而采取适当的行为， 以及更新服务器端的资源。 他们还允许访问推送通知， 和后台同步 APIs。

### Worker global contexts and functions #全局上下文和函数

Workers 运行在与当前窗口不同的全局上下文中 ! 当 Window 不能够被workers 直接访问的时候，很多相同的方法被定义在一个共享的 Mixin（`WindowOrWorkerGlobalScope`）中， 且通过workers 自己的 `WorkerGlobalScope` 得以访问， 这个 `WorkerGlobalScope` 也叫做派生上下文# derived contexts：

- [`DedicatedWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope) for dedicated workers
- [`SharedWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorkerGlobalScope) for shared workers
- [`ServiceWorkerGlobalScope`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope) for [service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

有些函数（一个子集）是所有workers 和主线程（from `WindowOrWorkerGlobalScope`）公用的: `atob()`, `btoa()`, `clearInterval()`， `clearTimeout()`,`dump()`, `setInterval()`, `setTimeout()` 。

TO READ

The following functions are **only** available to workers:

https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API#web_workers_concepts_and_usage
