---
title: Vue 动画&过渡
date: 2021-09-25
tags:
  - Vue
---


文档中，关于过渡&动画的部分讲解的非常清晰。 所以本文只是相当于阅读记录的过程。 

## 1. 进入/离开 & 列表过渡

### 1.1 概述

Vue 在 插入、更新、移除 Dom 时 ，提供了多种不同的方式以应用过渡效果， 包含以下工具：

- 在CSS 过渡 和 动画中自动应用 class
- 可以配合使用三方CSS动画库， 如 Animate.css
- 提供了过渡动画过程中的钩子函数， 使用JavaScript 直接操作Dom
- 可以配合使用第三方的JS 动画库， 如 Velocity.js



### 1.2 单元素/组件的过渡

Vue 提供了 `transition` 的封装组件，在下列情形中，可以给任何元素和组件添加进入、离开的过渡效果。 

- 条件渲染 （`v-if`）
- 条件展示（`v-show`）
- 动态组件
- 组件根节点

以下是一个典型的例子：

```html
//html
<div id="demo">
  <button v-on:click="show = !show">
    Toggle
  </button>
  <transition name="fade">
    <p v-if="show">hello</p>
  </transition>
</div>
```

```javascript
//js
new Vue({ el: '#demo', data: { show: true } })
```

```css
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
```



当插入或者删除包含在`transition` 组件中的元素时，Vue将会做以下处理：

1. 自动嗅探目元素是否应用了CSS过渡 或者 动画。 如果是： 在恰当的时机 添加\删除 CSS类名， 以应用CSS 动画
2. 如果过渡组件提供了`JavaScript钩子函数`， 这些钩子函数将会在恰当的时机被调用。 
3. 如果没有占到钩子函数，且也没有检测到CSS 过渡\动画, Dom 操作(插入\删除)在下一帧中立即执行。 

### 1.3 过渡的类名

![Transition Diagram]./assets/transition.png)

在进入\离开的过渡中，被切分成了两个大的部分，动画进入，和离开动画。 分别是：

1. `v-enter-active` : 定义进入过渡生效时的状态。 在<span style="color:red">整个进入过渡的阶段中应用</span>， 在元素被插入之前生效，在过渡\动画完成之后被移除。<span style="color:red">这个类可以被用来定义进入过渡的过程事件， 延迟 和 曲线函数</span>

   1. `v-enter` : 定义进入过渡开始的状态。 它在元素被插入之前生效。 在元素被插入之后的 下一帧 移除。 
   2. `v-enter-to` : 定义进入过渡的结束状态。**在元素被插入之后的下一帧生效(于此同时`v-enter`被移除)** ， 在过渡\动画完成之后移除。 

   

2. `v-leave-active` ： 定义离开过渡生效时的状态。 在整个离开过渡的阶段中应用， 在离开过渡被触发时立刻生效，在过渡\动画完成之后移除。 <span style="color:red">这个类可以被用来定义离开过渡的过程事件，延迟和取消函数。</span>

   1. `v-leave` : 定义离开过渡的开始状态。 在离开过渡被触发时立刻生效，下一帧被移除。
   2. `v-leave-to` : 在离开过渡被出发后下一帧生效（与此同时`v-leave` 被删除），在过渡\动画完成之后移除。

对于这些在过渡中切换的类名来说，如果你使用一个没有名字的`<transition>` ，则 `v-` 是这些类名的默认前缀。 如果你使用了`<transition name="my-transition">`, 那么`v-enter` 会替换为`my-transition-enter`

`v-enter-active` 和` v-leave-active` 可以控制进入\离开过渡的不同缓和曲线。 在下章节会有个示例说明。

### 1.4 CSS 过渡

常用的过渡，都是使用CSS过渡。 

以下是一个简单的例子:

```html
<div id="example-1">
  <button @click="show = !show">
    Toggle render
  </button>
  <transition name="slide-fade">
    <p v-if="show">hello</p>
  </transition>
</div>
```

```javascript
new Vue({
  el: '#example-1',
  data: {
    show: true
  }
})
```

```css
//css
/* 可以设置不同的进入和离开动画 */
/* 设置持续时间和动画函数 */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {

  transform: translateX(10px);
  opacity: 0;
}
```

