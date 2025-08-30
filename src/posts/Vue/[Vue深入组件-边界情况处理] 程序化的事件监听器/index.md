---
title: Vue深入组件 - 程序化的事件监听器
date: 2021-09-14
tags:
  - Vue
---


[toc]

## 1. 快速认识

一句话，来说，**<u>在同一个Vue实例中</u>**，`$on`、`$once` 用于设定监听器， 不同的是，`$once` 仅会被触发一次后立即失效。 而`$off` 则是一个主动的监听器销毁器。  `$emit` 则用于触发通过`$on`,`$once` 设定的监听器，即事件触发器/发射器。 

以下是一个简单的例子：

```javascript
<template>
  <div>
    <button @click="$emit('cusEvent', 'cusEvent trigger~')">Emit cusEvent</button>
    <button @click="$off('cusEvent')">destory cusEvent</button>
    <br>
    <button @click="$emit('cusOnceEvent','only once chance to trigger~~~')">Emit OnceEvent</button>
  </div>
</template>
<script>
export default {
  created() {
    this.$on("cusEvent", (msg) => {
      console.log(msg,'--line13');
    });
    this.$once("cusOnceEvent",(msg)=>{
      console.log(msg,'--line20');
    })
  },
};
</script>
```

![i](./assets/i.gif)

在生命周期`created` 钩子中，定义了两个事件监听器，分别是`$on` 监听的`cusEvent` 和 `$once` 监听的`cusOnceEvent`.从演示中看到，执行操作的结果符合我们的预期，`$once` 和`$on` 都可以通过`$emit` 触发，此外，`$once` 仅触发一次，且`$on`在被`$off` 销毁后，不再触发。 



## 2. 进一步认识， 使用方法

### 2.1 `vm.$on( event, callback )` 

> - **参数**：
>
>   - `{string | Array<string>} event` (数组只在 2.2.0+ 中支持)
>   - `{Function} callback`
>
> - **用法**：
>
>   监听当前实例上的自定义事件。事件可以由 `vm.$emit` 触发。回调函数会接收所有传入事件触发函数的额外参数。

传入的监听函数，并不是只能是单个单个注册，可以是一个数组，以`$on` 为例：

```javascript
<template>
  <div>
    <button @click="$emit('cusE01','E01')">cusE01</button>
    <button @click="$emit('cusE02','E02','hello')">cusE02</button>
    <button @click="$emit('cusE03','E03','hello','world')">cusE03</button>
  </div>
</template>
<script>
export default {
  created(){
    this.$on(['cusE01','cusE02','cusE03'],(...params)=>{
      console.log(params,'--line12');
      // ['E01'] '--line12'
      // ['E02', 'hello'] '--line12'
      // ['E03', 'hello', 'world'] '--line12'
    })
  }
};
</script>
<style></style>
```

### 2.2 `vm.$once( event, callback )`

> - **参数**：
>
>   - `{string} event`
>   - `{Function} callback`
>
> - **用法**：
>
>   监听一个自定义事件，但是只触发一次。一旦触发之后，监听器就会被移除。

注意，`$once` 接收参数仅可为一个，不可为数组，若为数组，在触发任意一个监听器后，全部即刻失效。

如下示例：

```javascript
<template>
  <div>
    <button @click="$emit('cusOnceE01','OnceE01')">cusOnceE01</button>
    <button @click="$emit('cusOnceE02','OnceE02','hello')">cusOnceE02</button>
    <button @click="$emit('cusOnceE03','OnceE03','hello','world')">cusOnceE03</button>
  </div>
</template>
<script>
export default {
  created(){
    this.$once(['cusOnceE01','cusOnceE02','cusOnceE03'],(...params)=>{
      console.log(params,'--line12');
      //  以下输出仅在相应按钮点击时触发一次，立刻失效，即以下输出只能单次输出其中一个
      // ['OnceE01'] '--line12'
      // 或
      // ['OnceE02', 'hello'] '--line12'
      // 或
      // ['OnceE03', 'hello', 'world'] '--line12'
    })
  }
};
</script>
<style></style>
```

### 2.3 `vm.$off( [event, callback] )`

> - **参数**：
>
>   - `{string | Array<string>} event` (只在 2.2.2+ 支持数组)
>   - `{Function} [callback]`
>
> - **用法**：
>
>   移除自定义事件监听器。
>
>   - 如果没有提供参数，则移除所有的事件监听器；
>   - 如果只提供了事件，则移除该事件所有的监听器；
>   - 如果同时提供了事件与回调，则只移除这个回调的监听器。

#### 2.3.1 同时销毁多个监听器

**指定销毁：**当`$off` 传入一个包含监听器事件名的数组作为第一个参数时，将可以指定的销毁**当前实例**多个定时器。

**全部销毁：**当`$off` 不传入任何参数时，将移除**当前实例**的所有监听器。 

```javascript
<template>
  <div>
    <button @click="$emit('cusE01','E01')">cusE01</button>
    <button @click="$emit('cusE02','E02','hello')">cusE02</button>
    <button @click="$emit('cusE03','E03','hello','world')">cusE03</button>
    <button @click="$off(['cusE01','cusE02'])">Off Multi</button><!--指定销毁/移除多个-->
    <button @click="$off()">Off All</button><!--全部销毁/移除-->
  </div>
</template>
<script>
export default {
  created(){
    this.$on(['cusE01','cusE02','cusE03'],(...params)=>{
      console.log(params,'--line12');
      // ['E01'] '--line12'
      // ['E02', 'hello'] '--line12'
      // ['E03', 'hello', 'world'] '--line12'
    })
  }
};
</script>
```



### 2.4 `vm.$emit( eventName, […args] )`

> **参数**：
>
> - `{string} eventName`
> - `[...args]`
>
> 触发当前实例上的事件。附加参数都会传给监听器回调。

注意，同时只能触发一个监听器事件。



## 3. 两个组件传值可通过事件总线EventBus实现究竟是怎么回事？

分析：

首先，我们知道，`$on` ，`$once` ，`$emit` 等等这些是"实例事件/方法"，也就是说，他们是Vue实例上的自带方法。 我们在`<script></script>`标签包裹的部分去使用这些方法时，前面需要带上`this` 才能够正常访问到。 就像这样`this.$on`, `this.$emit` ....， 我们也知道，`this` 通常，指向的就是`Vue` 实例对象。 

有了这些认识，我们能不能这样做，我们创建一个Vue实例，然后在A组件中去动态的给这个实例"埋设"一个监听器， 然后再在B组件中去动态触发这些监听器呢？

实际，这就是Vue EventBus 事件总线的核心思路。 它实际上很简洁。下面是一个实现的示例：

```javascript
// bus.js 实例化一个vue对象，并导出：
import Vue from 'vue'
export default new Vue();
```

再然后再在 A，B 组件中分别去导入：

```javascript
<script>
import Bus from './bus'
....
```

A, B 组件分别时这样去定义的：

```javascript
<!-- A -->
<template>
  <div>
    <p>Child A</p>
    <button @click="trigger">emit cusEvent</button>
  </div>
</template>

<script>
import Bus from './bus'
export default {
  data() {
    return {
      name: "jayce",
    };
  },
  methods:{
    trigger(){
      Bus.$emit('cusEvent',this.name)
    }
  }
};
</script>
```

```javascript
<!-- B -->
<template>
<p>Child B</p>
</template>
<script>
import Bus from './bus'
export default {
  created(){
    Bus.$on('cusEvent',(par)=>{
      console.log(par,'--line7');
    })
  }
}
</script>    
```

现在你就能在A组件中通过一个点击事件，将`name` 这个变量通过自定义事件传参的方式从A传递到B。
简单的描述一下：

我们在B组件中，周期函数`created`中，通过`Bus.$on` 给bus.js "埋设"了一个自定义事件，名为"cusEvent"， 且定义了一个形参`par` 在其回调函数中。

紧接着，我们在A组件中，通过点击事件触发了bus.js 中埋设的事件"cusEvent", 并传入了一个实参`name`。 

这样，知道点击了A组件中的该按钮，就会触发我们的自定义事件，然后通过回调函数的参数接收到“传参”。

可以简单总结下这个示例：

1.  "发送参数" 通过`$emit` 触发监听器实现，"接受参数"通过`$on` 监听事件被触发后回调所传入的值得到。
2. 你会发现，实际上事件总线，只和两个单独的组件有关，所以理论上，你可以实现任意两个组件之间的传值。而不仅仅是兄弟传值。

>【注意事项】：
>
>在该示例中，A组件中，去触发的时候，不能这样去写：
>
>```javascript
><template>
>  <div>
>    <p>Child A</p>
>    <button @click="Bus.$emit('cusEvent',name)">emit cusEvent</button>
>  </div>
></template>
>
><script>
>import Bus from './bus'
>export default {
>  data() {
>    return {
>      name: "jayce",
>    };
>  },
>};
></script>
>```
>
>直接把点击事件触发内容定义在Dom上是不可以的，会报错误找不到`Bus`， 而出现这个问题的原因是因为Vue组件的渲染周期导致的。 Vue 组件的dom渲染是异步执行的。 直到`mounted`才完成渲染，有可能Bus还没有被`import` 进来，就渲染解析到了dom上的`Bus.$emit....` 所以，就找不到，会报错。
>
>我们将点击事件触发内容定义在methods中，dom在渲染时，就只会找methods中存不存在对应的方法，在上例中，就是`trigger`这个方法。

