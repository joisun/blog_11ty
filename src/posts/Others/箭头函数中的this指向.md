---
title: 箭头函数中的this指向
date: 2023-07-08
tags:
  - post
---

[toc]

# 箭头函数的`this`指向问题

## 1. 函数中的`this` 指向

### 示例1:

```javascript
const name = 'window';
(function () {
  console.log(this.name)// window
})()
```

等同于：

```javascript
const name = 'window'
function func() {
  console.log(this.name)// window
}

window.func() // 可简写为 func();
```

### 示例2:

```javascript
const obj = {
  name: 'obj',
  func() {
    console.log(this.name)// obj
  },
}
obj.func()
```

从上面两个示例中可以得出，似乎，函数体中`this` 好像指向函数定义所在作用域对象中。 在这里，便是`window` 对象。 这是初步可以得出的结论。

**为了进一步验证，我们使用`call`来改变函数的调用对象试试：**

```javascript
const obj = {
  name: 'obj',
}

const name = 'window'
function func() {
  console.log(this.name)
}
window.func.call(obj)// obj
```

可见, 确实, 普通函数体中的`this` 指向调用该函数的对象, 即"调用者对象".

## 2. 箭头函数中的`this` 指向

### 示例1:

```javascript
const name = 'window'

const obj = {
  name: 'obj',
  func: () => {
    console.log(this.name)
  },
}
obj.func()// window
```

可见, 即便`func()`函数的调用对象是`obj`,但是输出结果却是`window`
