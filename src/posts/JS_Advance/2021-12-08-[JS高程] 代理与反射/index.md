---
title: JS高程 - 代理与反射
date: 2022-08-28
tags:
  - JavaScript
  - JS高程
  - ES6
  - Proxy
  - Reflect
---

### 代理与反射

ES6 新增的代理和反射为开发者提供了**拦截并向基本操作嵌入额外行为的能力**。 具体的来说，可以给目标对象定义一个关联的代理对象， 而这个代理对象可以作为抽象的目标对象来使用。 在对目标对象的各种操作影响目标对象之前， 可以在代理对象中对这些操作加以控制。

#### 1. 代理基础

- 代理时目标对象的抽象
- 代理可以用作目标对象的替身，但又完全独立于目标对象
- 目标对象既可以直接被操作，也可以通过代理来操作，但直接操作会绕过代理施予的行为。

##### 1.1 创建空的代理

最简单的代理是 **空代理**， 即除了作为一个 **抽象的目标对象**，什么也不做。默认情况下，

- 在代理对象上执行的所有操作都会无障碍地传播到目标对象。
- 因此，在任何可以使用目标对象的地方，都可以通过同样的方式来使用与之关联的代理对象。

代理是使用 Proxy 构造函数创建的。 这个构造函数，接收两个参数：1. 目标对象， 2.处理程序对象。缺少其中任何一个参数都会抛出 TypeError 。 要创建空代理， 可以传一个简单的对象字面量作为处理程序对象，从而让所有操作畅通无阻地抵达目标对象。

```js
const target = {
  id: 'target'
}

const handler = {}
const proxy = new Proxy(target, handler)
```

- id 属性会访问同一个值

  ```js
  console.log(target.id)// target
  console.log(proxy.id)// target
  ```

- 给目标属性赋值会反映在两个对象上，因为**两个对象访问的是同一个值**

  ```js
  target.id = 'foo'
  console.log(target.id)// foo
  console.log(proxy.id)// foo
  ```

- 给代理对象赋值会反映在两个对象上，因为**这个赋值会转移到目标对象**

  ```js
  proxy.id = 'bar'
  console.log(target.id) // bar
  console.log(proxy.id)// bar
  ```

- `hasOwnProperty()` 方法在两个地方，都会**应用到目标对象**。

  ```js
  console.log(target.hasOwnProperty('id')) // true
  console.log(proxy.hasOwnProperty('id')) // true
  ```

- Proxy.prototype 是 undefined， 因此不能使用 instanceof 操作符

```js
console.log(target instanceof Proxy) // Function has non-object prototype 'undefined' in instanceof check
console.log(proxy instanceof Proxy) // Function has non-object prototype 'undefined' in instanceof check
```

- 严格相等可以用来区分代理和目标

  ```js
  console.log(target === proxy) // false
  // console.log(target == proxy); // false
  ```

##### 1.2 定义捕获器

使用代理的主要目的是可以定义 **捕获器（trap）**，

- 捕获器就是在处理程序对象中定义的 “**基本操作的拦截器**”。
- 每个处理程序对象可以包含零个或多个捕获器，每个捕获器都对应一种基本操作，可以直接或间接在代理对象上调用。
- 每次在代理对象上调用这些基本操作时，**代理可以在这些操作传播到目标对象之前先调用捕获器函数，从而拦截并修改相应的行为。**

例如，可以定义一个 `get()` 捕获器，在 ECMAScript 操作以某种形式调用 `get()` 时触发。 下面的例子定义了一个 `get()` 捕获器：

```js
const target = {
  foo: 'bar'
}
const handler = {
  // 捕获器在处理程序对象中以方法名为键
  get() {
    return 'handler override'
  }
}

const proxy = new Proxy(target, handler)

console.log(proxy.anyfieldname)// handler override
console.log(proxy.foo)// handler override
console.log(target.foo)// bar
```

##### 1.3 捕获器参数 和 反射 API

**所有捕获器都可以访问相应的参数， 基于这些参数可以重建被捕获方法的原始行为 **。比如，`get()`捕获器会接收到 目标对象、要查询的属性 和 代理对象三个参数。

```js
const target = {
  foo: 'bar'
}
const handler = {
  // 捕获器在处理程序对象中以方法名为键
  get(trapTarget, property, receiver) {
    console.log(trapTarget === target)
    console.log(property)
    console.log(receiver === proxy)
  }
}

const proxy = new Proxy(target, handler)

proxy.foo
// true
// foo
// true
```

有了这些参数，就可以重建被捕获方法的原始行为：

```js
const target = {
  foo: 'bar'
}
const handler = {
  // 捕获器在处理程序对象中以方法名为键
  get(trapTarget, property, receiver) {
    return trapTarget[property]
  }
}

const proxy = new Proxy(target, handler)

console.log(proxy.foo)// bar
console.log(target.foo)// bar
```

所有捕获器都可以基于自己的参数重建原始操作，但并非所有捕获器行为都像 `get()` 那么简单。 因此，通过手写代码如法泡制的想法是不现实的。 实际上，开发者并不需要手动重建原始行为，而是可以铜鼓调用全局 Reflect 对象上 (封装了原始行为) 的同名方法来轻松重建。

处理程序对象中所有可以捕获的方法都有对应的反射 (Reflect) API 方法。 这些方法与捕获器拦截的方法具有相同名称和函数签名，而且也具有与被拦截方法相同的行为。因此， 使用反射 API 也可以像下面定义出空代理对象：

```js
const target = {
  foo: 'bar'
}
const handler = {
  // 捕获器在处理程序对象中以方法名为键
  get(trapTarget, property, receiver) {
    return Reflect.get(...arguments)
  }
}

const proxy = new Proxy(target, handler)

console.log(proxy.foo)// bar
console.log(target.foo)// bar
```

甚至还可以写的更简单一些：

```js
const target = {
  foo: 'bar'
}
const handler = {
  // 捕获器在处理程序对象中以方法名为键
  get: Reflect.get
}

const proxy = new Proxy(target, handler)

console.log(proxy.foo)// bar
console.log(target.foo)// bar
```

**事实上，如果真想创建一个可以捕获所有方法，然后将每个方法转发给对应 反射 API 的空代理，那么甚至不需要定义处理程序对象；**

```js
const target = {
  foo: 'bar'
}

const proxy = new Proxy(target, Reflect)

console.log(proxy.foo)// bar
console.log(target.foo)// bar
```

反射 API 为开发者准备好了样板代码，在此基础上来法者可以用最少的代码修改捕获的方法。 比如，下面的代码在某个属性被访问时，会对返回的值进行一番修饰：

```js
const target = {
  foo: 'bar',
  baz: 'qux'
}

const handler = {
  get(trapTarget, property, receiver) {
    let decoration = ''
    if (property === 'foo') {
      decoration = '!!!'
    }
    return Reflect.get(...arguments) + decoration
  }
}

const proxy = new Proxy(target, handler)

console.log(proxy.foo) // bar!!!
console.log(target.foo) // bar

console.log(proxy.baz) // qux
console.log(target.baz) // qux
```

##### 1.4 捕获器不变式

使用捕获器几乎可以改变所有基本方法的行为， 但是也不是没有限制。 根据 ECMAScript 规范， 每个捕获的方法都知道目标对象上下文、捕获函数签名，而捕获处理程序的行为必须遵循 “捕获器不变式” （trap invariant）。 捕获器不变式因方法不同而异，但通常都会防止捕获器定义出现过于反常的行为。

比如， 如果目标对象有一个不可配置且不可写的数据属性， 那么在捕获器返回一个与该属性不同的值时，会抛出 TypeError：

```js
const target = {}
Object.defineProperty(target, 'foo', {
  configurable: false,
  writable: false,
  value: 'bar',
})
const handler = {
  get() {
    return 'qux'
  },
}

const proxy = new Proxy(target, handler)
console.log(proxy.foo)// TypeError
```

##### 1.5 可撤销代理

有时候可能需要中断代理对象与目标对象之间的联系，对于使用 `new Proxy()` 创建的普通代理来说，这种联系会在代理对象的生命周期内一直持续存在。

Proxy 也暴露了 `revocable()` 方法， 这个方法支持撤销代理对象与目标对象的关联。撤销代理的操作是不可逆的。 而且，撤销函数（`revoke()`） 是幂等的，调用多少次的结果都是一样的。 撤销代理之后再度调用代理会抛出 TypeError。

撤销函数和代理对象是在实例化时同时生成的：

```js
const target = {
  foo: 'bar',
}
const handler = {
  get() {
    return 'intercepted'
  },
}

const { proxy, revoke } = Proxy.revocable(target, handler)

console.log(proxy.foo)
console.log(target.foo)

revoke()
console.log(proxy.foo) // Cannot perform 'get' on a proxy that has been revoked
```

##### 1.6 实用反射 API

**某些情况下，应该优先使用 反射 API，这是有一些理由的。**

1. **反射API 与 对象 API**

   在使用 反射 API 时， 要记住：
   1. 反射 API 并不限于捕获处理程序；
   2. 大多数反射 API 方法在 Object 类型上有对应的方法。

   通常，Object 上的方法适用于通用程序，而反射方法适用于细粒度的对象控制与操作。

2. **状态标记**

   很多反射方法返回称作 “状态标记” 的布尔值， 表示意图执行的操作是否成功。 有时候， 状态标记比那些返回修改后的对象或者抛出错误（取决于方法）的反射 API 方法更有用。 例如，可以使用反射API 对下面的代码进行重构。

   ```js
   // 初始代码
   const o = {}
   try {
     Object.defineProperty(o, 'foo', 'bar')
     console.log('success')
   }
   catch (e) {
     console.log('failure')
   }
   ```

   在定义新属性时，如果发生问题， `Reflect.defineProperty()` 会返回 `false`， 而不是抛出错误。因此使用这个反射方法可以这样重构上面的代码：

   ```js
   // 重构后的代码
   const o = {}
   if (Reflect.defineProperty(o, 'foo', { value: 'bar' })) {
     console.log('success')
   }
   else {
     console.log('failure')
   }
   ```

   以下反射方法都会提供状态标记：
   - `Reflect.defineProperty()`
   - `Reflect.preventExtensions()`
   - `Reflect.setPrototypeOf()`
   - `Reflect.set()`
   - `Reflect.deleteProperty()`

3. **用一等函数替代操作符**

   以下反射方法提供只有通过操作符才能完成的操作。
   - `Reflect.get()` : 可以替代对象属性访问操作符。
   - `Reflect.set()`： 可以替代`=` 赋值操作符。
   - `Reflect.has()`：可以替代 `in` 操作符或 `with()`
   - `Reflect.deleteProperty()` : 可以替代出 `delete` 操作符。
   - `Reflect.construct()` : 可以替代 `new` 操作符。

4. **安全地应用函数**

   在通过 apply 方法调用函数时，被调用的函数可能也定义了自己的 apply 属性（虽然可能性极小）。为了绕过这个问题， 可以使用定义在此 Function 原型上的 apply 方法， 比如：

   ```javascript
   Function.prototype.apply.call(myFunc, thisVal, argumentList)
   ```

   这种可怕的代码完全可以使用 `Reflect.apply` 来避免：

   ```js
   Reflect.apply(myFunc, thisVal, argumentList)
   ```

   ##### 1.7 代理另一个代理

   代理可以拦截反射 API 的操作，而这意味着完全可以创建一个代理，通过它去代理另一个代理。 这样，就可以在一个目标对象之上构建多层拦截网：

   ```js
   const target = {
     foo: 'bar'
   }

   const firstProxy = new Proxy(target, {
     get() {
       console.log('first proxy')
       return Reflect.get(...arguments)
     }
   })

   const secondProxy = new Proxy(firstProxy, {
     get() {
       console.log('second proxy')
       return Reflect.get(...arguments)
     }
   })

   console.log(secondProxy.foo)
   // second proxy
   // first proxy
   // bar
   ```

   ##### 1.8 代理的问题与不足

   代理是在 ECMAScript 现有基础之上构建起来的一套新 API， 因此其实现已经尽力做到最好了。很大程度上， 代理作为对象的虚拟层可以正常使用。 但是在某些情况下，代理也不能与现在的 ECMAScript 机制很好地协同。
   1. **代理中的 this**

      代理潜在的一个问题来源是 `this` 值。 我们知道，方法中的 `this` 通常指像调用这个方法的对象：

      ```js
      const target = {
        thisValEqulsProxy() {
          return this === proxy
        }
      }

      const proxy = new Proxy(target, {})

      console.log(target.thisValEqulsProxy())// false
      console.log(proxy.thisValEqulsProxy())// true
      ```

      从直觉上来讲， 这样完全没有问题： 调用代理上的任何方法，比如 `proxy.outerMethod()`， 而这个方法进而又会调用另一个方法， 如 `this.innerMethod()` , 实际上都会调用 `proxy.innerMethod()`。 多数情况下，这是符合预期的行为。 可是， 如果目标对象依赖于对象标识，那就可能碰到意料之外的问题。

      还记得 第 6 章中通过 WeakMap 保存私有变量的例子吧， 以下是它的简化版：

      ```js
      const wm = new WeakMap()

      class User {
        constructor(userId) {
          wm.set(this, userId)
        }

        set id(userId) {
          wm.set(this, userId)
        }

        get id() {
          return wm.get(this)
        }
      }
      ```

      由于这个实现依赖 User 实例的对象标识， 在这个实例被代理的情况下就会出问题：

      ```js
      const wm = new WeakMap()

      class User {
        constructor(userId) {
          wm.set(this, userId)
        }

        set id(userId) {
          wm.set(this, userId)
        }

        get id() {
          return wm.get(this)
        }
      }

      const user = new User(123)
      console.log(user.id)

      const userInstanceProxy = new Proxy(user, {})
      console.log(userInstanceProxy.id) // undefined
      ```

      <span style="color:red">这是因为 User 实例一开始使用目标对象作为 WeakMap 的键， 代理对象却尝试从自身取得这个实例。 要解决这个问题， 就需要重新配置代理， 把代理 User 实例改为代理 User 类本身。 之后再创建代理的实例就会以代理实例作为 WeakMap 的键了：</span>

      ```js
      const UserClassProxy = new Proxy(User, {})
      const proxyUser = new UserClassProxy(456)
      console.log(proxyUser.id)// 456
      ```

   2. **代理与内部槽位**

      代理与内置引用类型 （比如 Array） 的实例通常可以很好地协同，但有些 ECMAScript 内置类型可能会依赖代理无法控制的机制，结果导致在代理上调用某些方法会出错。

      一个典型的例子就是 Date 类型。 根据 ECMAScript 规范， Date 类型方法的执行依赖 this 值上的内部槽位 `[[NumberDate]]`。 代理对象上不存在这个内部槽位，而且这个内部槽位的值也不能通过普通的 `get()` 和 `set()` 操作访问到， 于是代理拦截后本应转发给目标对象的方法会抛出 TypeError :

      ```js
      const target = new Date()
      const proxy = new Proxy(target, {})

      console.log(proxy instanceof Date)
      proxy.getDate()// this is not a Date object.
      ```

#### 2. 代理捕获器与反射方法

代理可以捕获 13 种不同的基本操作。 这些操作有各自不同的反射 API 方法、参数、关联 ECMAScript 操作和不变式。
正如前面实例所展示的，有几种不同的 JavaScript 操作会调用同一个捕获器处理程序。 **不过，对于在代理对象上执行的任何一种操作，只会有一个捕获处理程序被调用。 不会存在重复捕获的情况。**
只要在代理上调用，所有捕获器都会拦截它们对应的反射 API 操作。

##### 2.1 `get()`

`get()` 捕获器会在获取属性值的操作中被调用。 对应的反射 API 方法位 `Reflect.get()`。

```js
const myTarget = {}
const proxy = new Proxy(myTarget, {
  get(target, property, receiver) {
    console.log('get()')
    return Reflect.get(...arguments)
  }
})

proxy.foo
// get()
```

1. **返回值**

   返回值无限制

2. **拦截的操作**
   - `proxy.property`
   - `proxy[property]`
   - `Object.create(proxy)[property]`
   - `Reflect.get(proxy, property, reveriver)`

3. **捕获器处理程序参数**
   - `target` ： 目标对象
   - `property` ： 引用的目标对象上的字符串键属性
   - `receiver` : 代理对象或继承代理对象的对象

4. **捕获器不变式**

   如果 `target.property` 不可写且不可配置， 则处理程序返回的值必须与 `target.property` 匹配。 如果 `target.property` 不可配置且 `[[Get]]` 特性为 `undefined`， 处理程序的返回值也必须是 `undefined` 。

##### 2.2 `set()`

`set()` 捕获器会在设置属性值的操作中被调用。 对应的反射 API 方法为 `Reflect.set()`。

```js
const myTarget = {}
const proxy = new Proxy(myTarget, {
  set(target, property, value, receiver) {
    console.log('set()')
    return Reflect.set(...arguments)
  }
})

proxy.foo = 'bar'
// set()
```

1. **返回值**

   返回 true 表示成功； 返回 false 表示失败， 严格模式下会抛出 TypeError 。

2. **拦截的操作**
   - `proxy.property = value`
   - `proxy[property] = value`
   - `Object.create(proxy)[property] = value`
   - `Reflect.set(proxy, property, value, receiver)`

3. **捕获器处理程序参数**
   - `target` : 目标对象
   - `property` : 引用的目标对象上的字符串键属性
   - `value` : 要赋给属性的值
   - `receiver`: 接收最初赋值的对象

4. **捕获器不变式**

   如果 `target.property` 不可写且不可配置，则不能修改目标属性的值。

   如果 `target.property` 不可配置且 `[[Set]]` 特性为 `undefined` ， 则不能修改目标属性的值。

   再严格模式下，处理程序中返回西岸`false` 会抛出 TypeError

##### 2.3 `has()`

`has()` 捕获器会在 `in` 操作符中被调用。 对应的反射 API 方法为 `Reflect.has()`

```js
const myTarget = {}
const proxy = new Proxy(myTarget, {
  has(target, property) {
    console.log('has()')
    return Reflect.has(...arguments)
  }
})

console.log('foo' in proxy) // false
// has()
```

1. **返回值**

   `has()` 必须返回布尔值， 表示属性是否存在。 返回非布尔值会被转型为布尔值。

2. **拦截的操作**
   - `property in proxy`
   - `property in Object.create(proxy)`
   - `with(proxy) ((property);)`
   - `Reflect.has(proxy, property)`

3. **捕获器处理程序参数**
   - `target` : 目标对象
   - `property` : 引用的目标对象上的字符串键属性，

4. **捕获器不变式**

   如果 `target.property` 存在且不可配置，则处理程序必须返回 `true`。

   如果 `target.property` 存在且目标对象不可扩展， 则处理程序必须返回 `true`。

##### 2.4 `defineProperty()`

`defineProperty()` 捕获器会在`Object.defineProperty()` 中被调用。对应的反射 API 方法为 `Reflect.defineProperty()`

```js
const myTarget = {}
const proxy = new Proxy(myTarget, {
  defineProperty(target, property, descriptor) {
    console.log('defineProperty()')
    return Reflect.defineProperty(...arguments)
  }
})
Object.defineProperty(proxy, 'foo', { value: 'bar' })

// defineProperty()
```
