---
title: Vue 修改Props值
date: 2021-07-31
tags:
  - Vue
---


这个业务场景应该是所有人都遇到过的。 一A组件， 其有一个子组件a ,  我们在a中接受到了A通过props 传过来的值， 然后我们用于试图的渲染， 但是如果a组件本身又需要具备修改这个视图绑定值的能力。 这个时候该怎么办？ 例如这个a是一个选择器组件， a能够选择值后，返回到A ，这是基本要求，  但是，如果我们同时需要从A组件中传递一个值给a, 实现当页面首次加载时，用于a组件的回显。 那么这时候该怎么办呢？

### 复现遇到的问题，以探索我们的解决办法。

我们写一个准备demo，大致效果如下：

![img](./assets/a.gif)

这是一个区域选择器，这里为了方便，直接使用了antdv 的cascader 组件， 并不是我们要关心的重点。 在这个页面中， 首先有一个根页面，即root wrapper。 

当点击  “open modal” 之后，弹起一个模态框（a-modal也是antdv 的组件）。 modal在弹起的时候，并没有初始值。 然后我们选定了区域后，控制台打印了选中的数据对象。 这里相关的代码如下：

modal wrapper :

```html
<FengzhaungCascader ref='FengzhaungCascader' @ok="onSelected"/>
```

```javascript
onSelected(value){
console.log(value,'--line21');
},
```

FengzhaungCascader:

<details>
    <summary>点击展开折叠代码</summary>
<code>
<pre>
&lt;template&gt;
  &lt;a-cascader :options="options" v-model="vmodel" placeholder="Please select" @change="onChange" /&gt;
&lt;/template&gt;
&lt;script&gt;
export default {
  data() {
    return {
      vmodel:[],
      options: [
        {
          value: 1,
          label: 'Zhejiang',
          children: [
            {
              value: 1,
              label: 'Hangzhou',
              children: [
                {
                  value: 2,
                  label: 'West Lake',
                },
              ],
            },
          ],
        },
        {
          value: 2,
          label: 'Jiangsu',
          children: [
            {
              value: 1,
              label: 'Nanjing',
              children: [
                {
                  value: 2,
                  label: 'Zhong Hua Men',
                },
              ],
            },
          ],
        },
      ],
    };
  },
  methods: {
    onChange(value) {
      this.vmodel = value;
      this.$emit('ok',value)
    },
  },
};
&lt;/script&gt;
</pre>
</code>
</details>



区域选择器组件，双向绑定了`vmodel`这个变量， 并且当选中完成时，通过 `this.$emit('ok',value)` 触发了我们的modal wrapper（父组件）中的自定义事件`@ok` 。然后在自定义实现的handler 中去打印了传过来选中参数对象。



### 遇到的问题

目前为止，我们实现了最基本的选中值，然后在父组件中成功拿到值。

但是，如果现在我们需要在cascader的父组件中，也就是modal wrapper中接受一个值，这个值可能时异步请求回来的值，用于cascader 组件的回显，也就是初始化值，这时候该怎么办 ？

按照最基本的，我们知道现在是从modal 中往 cascader 中传值，即父传子， 所以理所应当，满足Props 的传值条件。 

我们假定一个值，然后把这个值先在cascader 中拿到再说。 

相关代码如下：

modal wrapper:

```html
<FengzhaungCascader ref='FengzhaungCascader' :init="initArr" @ok="onSelected"/>
```

```javascript
export default {
  data(){
    return{
      initArr:[1,1,2]
    }
  },
    ...
```

FengzhaungCascader :

```html
 <a-cascader :options="options" :value="vValue" placeholder="Please select" @change="onChange" />
```

```javascript
export default {
  props:{
    init:{
      type:Array,
      default:function(){
        return [];
      }
    }
  },
  data() {
    return {
      vValue:[],
        ....
  },
  created(){
    console.log(this.init,'--line15');//[1,1,2]
  },
```

我们发现，在cascader created 钩子中，能够获取到我们通过Props 传过来的值。 但是问题也出现了。 

当前，我们视图上绑定的值，是vmodel , 传过来的值是init，这该怎么办呢 ? , 如果我们直接绑定了init , 我们都知道是不行的， 因为Props 是单向传递的， 他是父--> 子，  Vue 中并不希望你直接去绑定这个值，然后直接修改它。  所以我们现在有一点很明确。 **我们不能直接绑定prop传过来的init** 。

### 我们真的需要双向绑定吗？

实际上，这里面还有个非常关键的问题，那就是cascader的值，实际上并不是双向绑定值。 而就是值绑定，这也是文章题目中提到的“伪双向绑定”。

再次明确一下我们需要解决的问题。 我们的期望是什么样的？

**我们希望，当有初始值的时候，显示初始值。 当没有初始值的时候，显示选中值。 这个过程并不涉及双向绑定。** 

而双向绑定的应用场景是，类似Input 框这种，它的输入源是唯一的，只是为了试图和这个唯一的输入源实现实时同步。 它只绑定了一个变量。 

在我们的场景中，明显有两个输入源头，一个初始值，一个选中值，这是两个变量。 所以从更广义的一层上来说，这根本就没办法实现双向绑定。

这实际上也是我们在遇到这个问题时的出发点出现偏差，导致问题解决变得棘手的原因。  

### 解决方案

在我的实践中，我尝试了几种方法，其中提及最多的是利用computed的特性。 我也尝试了自己去用watch 实现，但是一般情况下还好，但是像我这里用到了modal 组件，存在v-if 控制的是否显示，还会出现父子组件的生命周期问题，虽然也有“边界处理 @hook:mounted” 这种奇淫巧计能解决，但是还是遇到很多问题，让我们的问题更加复杂化。  所以这里并不推荐使用watch 去尝试实现。 这里我将总结两种方法来记录解决这个问题的方案。

#### 方式一： 既然不能直接绑定，那就条件绑定 

刚才总结了问题，“我们不能直接绑定Prop传递过来的init” ：

FengzhaungCascader :

```html
<a-cascader :options="options" :value="vValue || init" placeholder="Please select" @change="onChange" />
```

```javascript
data() {
	return {
	vValue: undefined,
	....
},
methods: {
	onChange(value) {
	this.vmodel = value;
	...
}    
```

> 对象的或运算：
>
> ```javascript
> let obj = {name:'xiaoming'};
> null || obj 		// {name:'xiaoming'};
> undefined || obj 	//{name:'xiaoming'};
> {age:'8'} || obj 	//{name:'xiaoming'};
> ```

这样，我们就达成了期望，如果有选择值的时候，就优先绑定选择值，如果有初始值的时候，我们就绑定初始值。 

> :tipping_hand_man:  注意点：
>
> 1. 特别只绑定或运算的顺序， 如果是 `init || vValue` , 那么如果有初始值的情况下，选中值怎么都不会生效。
> 2. data 中的选择值的值绑定初始化为 `undefined` 或 `null` 或空值 ，不可为 `[]` ，因为 `[] || {name:'xiaoming'}` ==> `[]`



#### 方式二： 利用自定义事件，遵循Props的单向值传递，实现修改值和Props同步 

这个方法就更简单了加一行代码就可以了，也不用去考虑什么初始值，选中值，全部走初始值就好了。

FengzhaungCascader  :

```html
<a-cascader :options="options" :value="init" placeholder="Please select" @change="onChange" />
```

```javascript
  methods: {
    onChange(value) {
      this.$emit('ok', value)
    },
  },
```

modal wrapper:

```html
<FengzhaungCascader ref='FengzhaungCascader' :init="initArr" @ok="onSelected"/>
```

```javascript
    onSelected(value){
      console.log(value,'--line21');
      this.initArr = value;//加这一行
    },
```

当值发生变化，通过自定义事件将变化之重新给之前的初始值变量赋上选中的值即可。





> 这里的触发自cascader 组件的 `@change` 事件，如果是你自己写的组件，如果没有这个触发机制，可以使用computed 或者 watcher  去监听值变化从而触发自定义事件。
>
> ```javascript
> // computed 实现
> props: {
>   letter: {
>     type: String,
>     default: a
>   }
> },
> 
> computed: {
>   innerLetter: {
>     get () {
>       return this.letter;
>     }
>     set (value) {
>       this.$emit('change-letter', value);
>     }
>   }
> }
> 
> 
> // watcher 实现
> props: {
>   letter: {
>     type: String,
>     default: a
>   }
> },
> 
> data () {
>   return {
>     innerLetter: this.letter
>   }
> }
> 
> watch: {
>   letter (value) {
>     this.innerLetter = letter;
>   }
> }
> 
> methods: {
>   changeLetter (value) {
>     this.$emit('change-letter', value);
>   }
> }
> ```





相关的代码可以在这里下载 ： [link]

> (代码写在我自己搭建的本地demo环境，直接是不能跑的，如有需要可单独联系我)

