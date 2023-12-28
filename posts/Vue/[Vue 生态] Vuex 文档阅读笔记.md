[toc]

## 1. 最简单的 Store

```javascript
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.store({
    state:{
        count:0
    },
    mutations:{
        increment ( state ){
            state.count ++
        }
    }
})
```

现在可以通过`store.state` 来获取状态对象， 以及通过`store.commit` 来触发状态的变更。

```javascript
store.commit('increment')
console.log(store.state.count) // 1
```

但是，现在无法在其他组件上访问到状态对象。 为了达到这一目的，我们需要将store和Vue 实例关联起来。 

在main.js 中

```javascript
// 引入store 后
new Vue({
    el:'#app',
    store:store,
})
```

这样，从所有子组件中，都可以这样去修改和访问state状态对象中的值：

```javascript
methods:{
    increment(){
        this.$store.commit('increment')
        console.log(this.$store.state.count)
    }
}
```

> :star: 我们修改状态对象中的值，并不是直接去修改， 而是通过提交 mutation 。 
>
> 这样做的目的，是代码阅读更加易于理解，且易于调试。 

另外， 由于store 中的状态是响应式的，在组件中调用store 中的状态，仅需要在计算属性中去返回即可。 触发 变化也仅仅实在组件的methods 中提交 mutation 。 



## **2. 核心概念**

### 2.1 State

#### 2.1.1 在Vue 组件中获得Vuex 状态

Vuex 的状态存储时响应式的，从store 实例中读取状态的最简单方法就是在计算属性中 返回某个状态：

```javascript
const Counter  = {
    template : `<div>{{ count }}</div>`,
    computed: {
        count () {
            return this.$store.state.count
        }
    }
}
```



#### 2.1.2 `mapState` 辅助函数

当一个组件需要获取多个状态 ， 每一个状态都上上面那样去定义computed 有一些繁琐， vue 为了简化这个过程，给我们提供了 `mapState` 辅助函数。

```javascript
import { mapState } from 'vuex'

export default{
    //...
    computed: mapState({
        count: state=> state.count,
        countAlias : 'count'
    })
}
```

当计算属性中的属性名和state 中的子节点相同时，可以直接将名称字符串作为一个字符串数组元素， 然后将这个字符串数组传入`mapState`

```javascript
computed:mapState([
    'count'
])
//即， this.count 的映射为 store.state.count
```

#### 2.1.3 对象展开运算符

`mapState` 函数返回的是一个对象， 怎么将它与局部计算属性混合使用呢 ？

```javascript
computed:{
    localComputed(){/*...*/},
    ...mapState({
        //...
    })
}
```



### 2.2 Getters

有时候，我们需要从 store 中的 state 中派生出一些状态，例如对列表进行过滤并计数：

```javascript
computed: {
    doneTodosCount (){
        return this.$store.state.todos.filter(todo => todo.done).length
    }
}
```

如果，有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数，然后再多出导入它 —— 无论哪种方式都不是很理想。

Vuex 允许它们在 store 中定义`getter` （可以认为是store的计算属性。） 就像计算属性一样，**getter 的返回值会根据它的依赖被缓存起来，其只有当它的依赖值发送了改变才会被重新计算**。

Getter 接收 state 作为其第一个参数 ：

```javascript
const store = new Vuex.Store({
    state:{
        todos:[
            { id: 1, text: '...', done: true},
            { id: 2, text: '...', done: false}
        ]
    },
    getters: {
        doneTodos: state=>{
            return state.todos.filter(todo=>todo.done)
        }
    }
})
```



#### 2.2.1 通过属性访问

Getter 会暴露为 `store.getters` 对象， 你可以以属性的形式访问这些值：

```javascript
store.getters.doneTodos // [{ id: 1, text: '...', done: true }]
```

Getter 也可以接收其他getter作为第二个参数：

```javascript
getter:{
    //...
    doneTodosCount: (state,getters) => {
        return getters.doneTodos.length
    }
}
```

```javascript
store.getters.doneTodosCount // -1
```

我们可以很容易地在任何组件中使用它：

```javascript
computed: {
    dontTodosCount (){
        return this.$store.getter.doneTodosCount
    }
}
```

**注意， getter 在通过属性访问时是作为Vue 的响应式系统的一部分缓存其中的**





#### 2.2.2 通过方法访问 

你也可以通过让getter 返回一个函数，来实现给getter 传参。 在你对 store 里的数组进行查询时会非常有用。

```javascript
getters: {
    //...
    getTodoById: (state) => (id) => {
        return state.todos.find(todo => todo.id === id)
    }
}
```

> :star:以上代码等同于
>
> ```javascript
> getters；{
>     //...
>     getTodoById: function(state){
>         return function(id){
>             return state.todos.find(todo => todo.id === id)
>         }
>     }
> }
> ```

```javascript
store.getters.getTodoById(2);// { id:2, text: '...', done: false }
```

> :warning: 这里的调用很奇怪，这个state 形参是怎么回事?
>
> 这里涉及到 “函数的柯里化”， 简单的说：
>
> ```javascript
> //①
> const add = (x, y) => x + y;
> add(2,3) // 5
> ```
>
> 这段代码的柯里化将会是：
>
> ```javascript
> //②
> const add = x => y => x + y;
> ```
>
> 其es5代码为：
>
> ```javascript
> const add = function(x){
>     return function(y){
>         return x + y
>     }
> }
> ```
>
> 因此:
>
> ```javascript
> getters: {
>     //...
>     getTodoById: (state) => (id) => {
>         return state.todos.find(todo => todo.id === id)
>     }
> }
> ```
>
> 就可以写成其等同式（就像② 和 ①是等同的）：
>
> ```javascript
> getters: {
>     //...
>     getTodoById: (state,id) => {
>         return state.todos.find(todo => todo.id === id)
>     }
> }
> ```
>
> 而 state 这个参数是getters 的默认传参，因此，可以这样去调用：
>
> ```javascript
> store.getters.getTodoById(2);
> ```
>
> 理解参考自：
>
> https://stackoverflow.com/a/32787782/11375753
> https://stackoverflow.com/a/67221323/12261182

**注意: getter 在通过方法访问时， 每次都会去进行调用， 而不会缓存结果。**



#### 2.2.3 mapGetters 辅助函数

`mapGetters` 辅助函数仅仅是将 store 中的getter 映射到局部计算属性：

```javascript
import { mapGetters } from 'vuex'

export default {
    //...
    computed:{
        // 使用对用展开运算符将getter 混入 computed 对象中
        ...mapGetters({
            'doneTodosCount',
            'anotherGetter',
            //...
        })
    }
}
```

如果你想将一个 getter 属性另取一个名字， 使用对象形式：

```javascript
...mapGetters({
    // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
    doneCount: 'doneTodosCount'
})
```





### 2.3 Mutation

要更改 Vuex 的 store 中的状态的唯一方法是提交 mutation  。Vuex 中的mutation非常类似于事件 ： 每个 mutation 都有一个字符串的 **事件类型（type）** 和一个 **回调函数（handler）**。 这个回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数：

```javascript
const store = new Vuex.store({
    state: {
        count: 1
    },
    mutations: {
        increment (state){
            // 变更状态
            state.count ++ 
        }
    }
})
```

你不能直接调用一个 mutation handler 。 这个选项更像是事件注册 ： “当触发一个类型（type）为 `increment` 的 mutation 时， 调用此函数。 " 要唤醒一个 mutation handler ， 你需要以相应的 type 调用 store.commit 方法：

```javascript
store.commit('increment')
```

#### 2.3.1 提交载荷（Payload）

你可以向 `store.commit` 传入额外的参数， 即 mutation的 **载荷(payload)**:

```javascript
//...
mutations: {
    increment (state, n){
        state.count += n
    }
}
```

```javascript
store.commit('increment',10)
```

在大多数情况下， 载荷（Payload） 应该是一个对象， 这样可以包含多个字段并且记录的 mutation 会更易读：

```javascript
//...
mutations:{
    increment(state, payload){
        state.count += payload.amount
    }
}
```

```javascript
store.commit('increment',{
    amount:10
})
```



#### 2.3.2 对象风格的提交方式

提交一个mutation 的另一种方式是直接使用包含 `type`属性的对象 ：

```javascript
store.commit({
    type: 'increment',
    amount: 10
})
```

当使用对象风格的提交方式， 整个对象都作为载荷传给 mutation函数， 因此 handler 保持不变 :

```javascript
mutations:{
    increment (state, payload){
        state.count += payload.amount
    }
}
```



#### 2.3.3 Mutations 需遵守 Vue 的响应规则

既然Vuex 的 store 中的状态是响应式的，那么当我们变更状态时， 监视状态的Vue 组件也会自动更新。这也意味着Vuex 中的mutation 也需要与使用Vue 一样遵守一些注意事项。

1. 最好提前在你的 store 中初始化好所有属性 

2. **当需要在对象上添加新属性时， 你应该**

   - 使用 `Vue.set(obj, 'newProp', 123)` ， 或者

   - 以新对象替换老对象。 例如， 利用 对象展开运算符 ， 我们可以这样写：

     ```javascript
     state.obj = { ...state.obj, newProp: 123 }
     ```



#### 2.3.4 使用常量替代 Mutation 事件类型

使用常量替代 mutation 事件类型在各种 Flux 实现中是很常见的模式。 这样可以使得 linter 之类的工具发挥作用， 同时**把这些常量放在单独的文件中可以让你的代码合作者对整个 app 包含的mutation 一目了然**：

```javascript
// mutation-types.js

export const SOME_MUTATION = 'SOME_MUTATION'
```

```javascript
// store.js
import Vuex from 'vuex'
import { SOME_MUTATION } from './mutation-types'

const store = new Vuex.store({
    state: {/*...*/},
    mutations:{
        // 我们可以使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
        [SOME_MUTATION](state){
            // mutate state
        }
    }        
})
```



#### 2.3.5 Mutation 必须是同步函数

一天重要的原则就是要记住 mutation **必须是同步函数**。

#### 2.3.6 在组件中提交 Mutation

你可以在组件中使用 `this.$store.commit('xxx')` 提交 mutation, 或者使用 `mapMutations` 辅助函数将组件中的 methods 映射为 `store.commit` 调用 （需要在根节点注入 `store`）。

```javascript
import { mapMutations } from 'vuex'

export default {
    //...
    methods:{
        ...mapMutations([
            'increment', // 将 `this.increment() ` 映射为 `this.$store.commit('increment')`
            
            //`mapMutations` 也支持载荷（Payload）:
			'incrementBy'// 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
        ]),
        ...mapMutations({
            add:'increment' // alias, 将 `this.add()` 映射为 `this.$store.commit('increment')`
        })
    }
}
```





### 2.4 Action

Action 类似于 mutation ， 不同在于 ：

- Action **提交的是 mutation** , 而不是直接变更状态。
- **Action 可以包含任意异步操作。**

一个简单的 action

```javascript
const store = new Vuex.Store({
    state: {
        count: 0
    },
    mutations: {
        increment (state) {
            state.count++
        }
    },
    actions:{
        increment (context){
            context.commit('increment')
        }
    }
})
```

> Action 函数接受一个与 store 实例具有相同方法和属性的 context 对象，因此你可以调用 `context.commit` 提交一个 mutation，或者通过 `context.state` 和 `context.getters` 来获取 state 和 getters。当我们在之后介绍到 [Modules](https://vuex.vuejs.org/zh/guide/modules.html) 时，你就知道 context 对象为什么不是 store 实例本身了。

实践中， 我们经常会用到 ES2015 的参数解构 来简化代码

```javascript
actions :{
    increment({ commit }){
        commit('increment')
    }
}
```





#### 2.4.1 分发 Action

Action 通过 `store.dispatch` 方法触发：

```javascript
store.dispatch('increment')
```

乍一眼看上去感觉多此一举，我们直接分发 mutation 岂不更方便？实际上并非如此，还记得 **mutation 必须同步执行**这个限制么？Action 就不受约束！我们可以在 action 内部执行**异步**操作：

```javascript
actions: {
    incrementAsync({ commit }){
        setTimeout(()=>{
            commit('increment')
        },1000)
    }
}
```

Actions 支持 同样的载荷方式和对象方式进行分发 ：

```javascript
// 以载荷形式分发
store.dispatch('incrementAsync',{
    amount: 10
})

// 以对象形式分发
store.dispatch({
    type:'incrementAsync',
    amount: 10
})
```

#### 2.4.2 在组件中分发 Action

你在组件中使用`this.$store.dispatch('xxx')` 分发 action, 或者使用 `mapActions` 辅助函数将组件的 methods 映射为 `store.dispatch` 调用 

```javascript
import {  mapActions }  from 'vuex'

export default {
    //...
    methods:{
        ...mapActions([
            'increment',// 将`this.increment()`映射为 `this.$store.dispatch('increment')`
            //`mapActions`  也支持载荷 ：
            'incrementBy'// 将`this.incrementBy(amount)` 映射为 `this.$store.dispatch('incrementBy',amount)`
        ]),
        ...mapActions({
            add: 'increment' // alias 将`this.add()` 映射为 `this.$store.dispatch('increment')`
        })
    }
}
```



#### 2.4.3 组合 Action

Action 通常是异步的， 那么如何知道 action 什么时候结束呢 ？ 更重要的是， 我们如何才能组合多个 action, 以处理更加复杂的异步流程 ？

首先，你需要明白， `store.dispatch` 可以处理被触发的 action 的处理函数返回的 Promise, 并且`store.dispatch` 仍旧返回 Promise :

```javascript
actions: {
    actionA({ commit }){
        return new Promise((resolve, reject)=>{
            setTimeout(()=>{
                commit('someMutation')
                resolve()
            },1000)
        })
    }
}
```

现在你可以 ：

```javascript
store.dispatch('actionA').then(() => {
    //...
})
```

在另外一个 acion 中也可以：

```javascript
actions : {
    //...
    actionB({ dispatch, commit }){
        return dispatch('actionA').then(() => {
            commit('someOtherMutation')
        })
    }
}
```

最后，如果我们利用 async / await ， 我们可以如下组合 action:

```javascript
// 假设 getData() 和 getOtherData() 返回的是 Promise

actions: {
  async actionA ({ commit }) {
    commit('gotData', await getData())
  },
  async actionB ({ dispatch, commit }) {
    await dispatch('actionA') // 等待 actionA 完成
    commit('gotOtherData', await getOtherData())
  }
}
```

> 一个 `store.dispatch` 在不同模块中可以触发多个 action 函数。在这种情况下，只有当所有触发函数完成后，返回的 Promise 才会执行。



### 2.5 Module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成**模块（module）**。每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块——从上至下进行同样方式的分割

```javascript
const moduleA = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... },
  getters: { ... }
}

const moduleB = {
  state: () => ({ ... }),
  mutations: { ... },
  actions: { ... }
}

const store = new Vuex.Store({
  modules: {
    a: moduleA,
    b: moduleB
  }
})

store.state.a // -> moduleA 的状态
store.state.b // -> moduleB 的状态
```

#### 2.5.1 模块的局部状态

对于模块内部的 mutation 和 getter，接收的第一个参数是**模块的局部状态对象**。

```javascript
const moduleA = {
  state: () => ({
    count: 0
  }),
  mutations: {
    increment (state) {
      // 这里的 `state` 对象是模块的局部状态
      state.count++
    }
  },

  getters: {
    doubleCount (state) {
      return state.count * 2
    }
  }
}
```

同样，对于模块内部的 action，局部状态通过 `context.state` 暴露出来，根节点状态则为 `context.rootState`：

```javascript
const moduleA = {
  // ...
  actions: {
    incrementIfOddOnRootSum ({ state, commit, rootState }) {
      if ((state.count + rootState.count) % 2 === 1) {
        commit('increment')
      }
    }
  }
}
```

对于模块内部的 getter，根节点状态会作为第三个参数暴露出来：

```javascript
const moduleA = {
  // ...
  getters: {
    sumWithRootCount (state, getters, rootState) {
      return state.count + rootState.count
    }
  }
}
```

####  2.5.2 命令空间

默认情况下，模块内部的 action、mutation 和 getter 是注册在**全局命名空间**的——这样使得多个模块能够对同一 mutation 或 action 作出响应。

如果希望你的模块具有更高的封装度和复用性，你可以通过添加 `namespaced: true` 的方式使其成为带命名空间的模块。当模块被注册后，它的所有 getter、action 及 mutation 都会自动根据模块注册的路径调整命名。例如：

```js
const store = new Vuex.Store({
  modules: {
    account: {
      namespaced: true,

      // 模块内容（module assets）
      state: () => ({ ... }), // 模块内的状态已经是嵌套的了，使用 `namespaced` 属性不会对其产生影响
      getters: {
        isAdmin () { ... } // -> getters['account/isAdmin']
      },
      actions: {
        login () { ... } // -> dispatch('account/login')
      },
      mutations: {
        login () { ... } // -> commit('account/login')
      },

      // 嵌套模块
      modules: {
        // 继承父模块的命名空间
        myPage: {
          state: () => ({ ... }),
          getters: {
            profile () { ... } // -> getters['account/profile']
          }
        },

        // 进一步嵌套命名空间
        posts: {
          namespaced: true,

          state: () => ({ ... }),
          getters: {
            popular () { ... } // -> getters['account/posts/popular']
          }
        }
      }
    }
  }
})
```

启用了命名空间的 getter 和 action 会收到局部化的 `getter`，`dispatch` 和 `commit`。换言之，你在使用模块内容（module assets）时不需要在同一模块内额外添加空间名前缀。更改 `namespaced` 属性后不需要修改模块内的代码。

##### 2.5.2.1 在带命名空间的模块内访问全局内容（Global Assets）

如果你希望使用全局 state 和 getter，`rootState` 和 `rootGetters` 会作为第三和第四参数传入 getter，也会通过 `context` 对象的属性传入 action。

若需要在全局命名空间内分发 action 或提交 mutation，将 `{ root: true }` 作为第三参数传给 `dispatch` 或 `commit` 即可。

```js
modules: {
  foo: {
    namespaced: true,

    getters: {
      // 在这个模块的 getter 中，`getters` 被局部化了
      // 你可以使用 getter 的第四个参数来调用 `rootGetters`
      someGetter (state, getters, rootState, rootGetters) {
        getters.someOtherGetter // -> 'foo/someOtherGetter'
        rootGetters.someOtherGetter // -> 'someOtherGetter'
      },
      someOtherGetter: state => { ... }
    },

    actions: {
      // 在这个模块中， dispatch 和 commit 也被局部化了
      // 他们可以接受 `root` 属性以访问根 dispatch 或 commit
      someAction ({ dispatch, commit, getters, rootGetters }) {
        getters.someGetter // -> 'foo/someGetter'
        rootGetters.someGetter // -> 'someGetter'

        dispatch('someOtherAction') // -> 'foo/someOtherAction'
        dispatch('someOtherAction', null, { root: true }) // -> 'someOtherAction'

        commit('someMutation') // -> 'foo/someMutation'
        commit('someMutation', null, { root: true }) // -> 'someMutation'
      },
      someOtherAction (ctx, payload) { ... }
    }
  }
}
```

##### 2.5.2.2 在带命名空间的模块注册全局 action

若需要在带命名空间的模块注册全局 action，你可添加 `root: true`，并将这个 action 的定义放在函数 `handler` 中。例如：

```js
{
  actions: {
    someOtherAction ({dispatch}) {
      dispatch('someAction')
    }
  },
  modules: {
    foo: {
      namespaced: true,

      actions: {
        someAction: {
          root: true,
          handler (namespacedContext, payload) { ... } // -> 'someAction'
        }
      }
    }
  }
}
```

##### 2.5.2.3 带命名空间的绑定函数

当使用 `mapState`, `mapGetters`, `mapActions` 和 `mapMutations` 这些函数来绑定带命名空间的模块时，写起来可能比较繁琐：

```js
computed: {
  ...mapState({
    a: state => state.some.nested.module.a,
    b: state => state.some.nested.module.b
  })
},
methods: {
  ...mapActions([
    'some/nested/module/foo', // -> this['some/nested/module/foo']()
    'some/nested/module/bar' // -> this['some/nested/module/bar']()
  ])
}
```

对于这种情况，你可以将模块的空间名称字符串作为第一个参数传递给上述函数，这样所有绑定都会自动将该模块作为上下文。于是上面的例子可以简化为：

```js
computed: {
  ...mapState('some/nested/module', {
    a: state => state.a,
    b: state => state.b
  })
},
methods: {
  ...mapActions('some/nested/module', [
    'foo', // -> this.foo()
    'bar' // -> this.bar()
  ])
}
```

而且，你可以通过使用 `createNamespacedHelpers` 创建基于某个命名空间辅助函数。它返回一个对象，对象里有新的绑定在给定命名空间值上的组件绑定辅助函数：

```js
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapActions } = createNamespacedHelpers('some/nested/module')

export default {
  computed: {
    // 在 `some/nested/module` 中查找
    ...mapState({
      a: state => state.a,
      b: state => state.b
    })
  },
  methods: {
    // 在 `some/nested/module` 中查找
    ...mapActions([
      'foo',
      'bar'
    ])
  }
}
```

##### 2.5.2.4 给插件开发者的注意事项

如果你开发的[插件（Plugin）](https://vuex.vuejs.org/zh/guide/plugins.html)提供了模块并允许用户将其添加到 Vuex store，可能需要考虑模块的空间名称问题。对于这种情况，你可以通过插件的参数对象来允许用户指定空间名称：

```js
// 通过插件的参数对象得到空间名称
// 然后返回 Vuex 插件函数
export function createPlugin (options = {}) {
  return function (store) {
    // 把空间名字添加到插件模块的类型（type）中去
    const namespace = options.namespace || ''
    store.dispatch(namespace + 'pluginAction')
  }
}
```

#### 2.5.3 模块动态注册

在 store 创建**之后**，你可以使用 `store.registerModule` 方法注册模块：

```js
import Vuex from 'vuex'

const store = new Vuex.Store({ /* 选项 */ })

// 注册模块 `myModule`
store.registerModule('myModule', {
  // ...
})
// 注册嵌套模块 `nested/myModule`
store.registerModule(['nested', 'myModule'], {
  // ...
})
```

之后就可以通过 `store.state.myModule` 和 `store.state.nested.myModule` 访问模块的状态。

模块动态注册功能使得其他 Vue 插件可以通过在 store 中附加新模块的方式来使用 Vuex 管理状态。例如，[`vuex-router-sync` (opens new window)](https://github.com/vuejs/vuex-router-sync)插件就是通过动态注册模块将 vue-router 和 vuex 结合在一起，实现应用的路由状态管理。

你也可以使用 `store.unregisterModule(moduleName)` 来动态卸载模块。注意，你不能使用此方法卸载静态模块（即创建 store 时声明的模块）。

注意，你可以通过 `store.hasModule(moduleName)` 方法检查该模块是否已经被注册到 store。

#### 2.5.4 保留 state

在注册一个新 module 时，你很有可能想保留过去的 state，例如从一个服务端渲染的应用保留 state。你可以通过 `preserveState` 选项将其归档：`store.registerModule('a', module, { preserveState: true })`。

当你设置 `preserveState: true` 时，该模块会被注册，action、mutation 和 getter 会被添加到 store 中，但是 state 不会。这里假设 store 的 state 已经包含了这个 module 的 state 并且你不希望将其覆写。

#### 2.5.5 模块重用

有时我们可能需要创建一个模块的多个实例，例如：

- 创建多个 store，他们公用同一个模块 (例如当 `runInNewContext` 选项是 `false` 或 `'once'` 时，为了[在服务端渲染中避免有状态的单例 (opens new window)](https://ssr.vuejs.org/en/structure.html#avoid-stateful-singletons))
- 在一个 store 中多次注册同一个模块

如果我们使用一个纯对象来声明模块的状态，那么这个状态对象会通过引用被共享，导致状态对象被修改时 store 或模块间数据互相污染的问题。

实际上这和 Vue 组件内的 `data` 是同样的问题。因此解决办法也是相同的——使用一个函数来声明模块状态（仅 2.3.0+ 支持）：

```js
const MyReusableModule = {
  state: () => ({
    foo: 'bar'
  }),
  // mutation, action 和 getter 等等...
}
```







## 3.进阶

**项目结构**

Vuex 并不限制你的代码结构。但是，它规定了一些需要遵守的规则：

1. 应用层级的状态应该集中到单个 store 对象中。
2. 提交 **mutation** 是更改状态的唯一方法，并且这个过程是同步的。
3. 异步逻辑都应该封装到 **action** 里面。

只要你遵守以上规则，如何组织代码随你便。如果你的 store 文件太大，只需将 action、mutation 和 getter 分割到单独的文件。

对于大型应用，我们会希望把 Vuex 相关代码分割到模块中。下面是项目结构示例：

```bash
├── index.html
├── main.js
├── api
│   └── ... # 抽取出API请求
├── components
│   ├── App.vue
│   └── ...
└── store
    ├── index.js          # 我们组装模块并导出 store 的地方
    ├── actions.js        # 根级别的 action
    ├── mutations.js      # 根级别的 mutation
    └── modules
        ├── cart.js       # 购物车模块
        └── products.js   # 产品模块
```

请参考[购物车示例 (opens new window)](https://github.com/vuejs/vuex/tree/dev/examples/shopping-cart)。