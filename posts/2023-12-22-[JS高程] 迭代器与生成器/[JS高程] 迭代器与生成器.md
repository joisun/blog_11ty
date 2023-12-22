## 0. 引言

在软件开发领域， ”迭代“的意思是按照顺序反复多次执行一段程序， 通常会有明确的终止条件。 

ES6 新增了两个高级特性 ： 迭代器和生成器。 这两个特性使得迭代的实现更加的 清晰、高效、方便。



## 1. 理解迭代

计数循环，就是Js 中的一种最简单的迭代：

```javascript
for (let i = 1; i <= 10; ++i){
    console.log(i)
}
```

**循环和迭代的关系**

循环是迭代的基础， 它指定了迭代的次数和顺序，以及迭代的操作。

**迭代的对象**

迭代会在一个有序的集合上进行， 普通数组是最典型的例子。 此前，我们几乎所有的迭代操作都是针对数组。 

**传统迭代存在的问题**

1. <u>迭代之前需要实现知道如何使用数据结构</u>。 数组中的每一项都只能先通过引用取得数组对象， 然后再通过`[]` 操作符取得特定索引位置上的项。  然而这种方式仅适用于普通数组， 并不适用于所有的数据结构，例如，ES6 新增的Map、Set。
2. <u>遍历顺序并不是数组结构固有的</u>。  还是以上面说的，通过递增索引来访问数据是特定于数组类型的方式， 并不是适用于其他具有隐式顺序的数据结构。 

> ES5 新增的`forEach` 方法，尝试去实现通用迭代， 但是，它不能够终止 （不能return）， 因此还是只适用于数组结构。 

> 此前，执行迭代必须使用循环或者其他辅助结构。 随之代码量的增加，代码会变得混乱。  很多语言都通过原生语言结构解决了这个问题， <ud>开发者无须事先知道如何迭代就能实现迭代操作</ud>。 这个解决方案就是**迭代器模式**。

## 2. 迭代器模式

### 2.1 什么而是迭代器模式

所谓迭代器模式，实际上是在描述一个方案—— <u>可迭代对象</u> 实现了正式的可迭代 Iterable 接口， 可以通过迭代器 Iterator 消费（consume）。

**到底在说什么？**

说人话就是： ”可迭代对象实现了可迭代接口，可以被迭代“。 而ES6通过扩展可迭代对象，从而**解决了传统迭代的问题**， 也就是说为了解决这种问题，新增了一类模式，叫做迭代器模式。

> 可迭代对象是一种抽象的说法， 其最显著的两大特征为：
>
> 1. 有限的元素
> 2. 无歧义的遍历顺序
>
> 基本上，我们**一般**说可迭代对象都是指 数组 或者 集合 这样的集合类型的对象。 但是，可迭代对象**实际上不一定是集合对象**，也可以是仅仅具有类似数组行为的其他数据类型， 

> 迭代器（iterator) 是按需创建的一次性对象。 每个迭代器都会关联一个 可迭代对象， 而迭代器会暴露迭代其关联 可迭代对象 的API， 迭代器无需了解其关联 可迭代对象 的结构，只需要知道如何取得连续的值。 

### 2.2 可迭代协议 (实现Iterable接口协议)

实现Iterable 接口（可迭代协议）要求同时具备两种能力： 支持迭代的自我识别能力和创建实现Iterator 接口的对象的能力。 

这意味着必须暴露一个属性作为 “默认迭代器” —— `[Symbol.iterator]` 
<u>**这个默认迭代器属性必须引用一个 迭代器工厂函数， 调用这个工厂函数必须返回一个新迭代器。**</u>

很多的内置类型都实现了 Iterable 接口 ：

- 字符串
- 数组
- 映射Map
- 集合Set
- arguments 对象
- NodeList 等 DOM 集合类型

```javascript
let str = 'abc'; 
let arr = ['a', 'b', 'c']; 
let map = new Map().set('a', 1).set('b', 2).set('c', 3); 
let set = new Set().add('a').add('b').add('c'); 
let els = document.querySelectorAll('div'); 
 
// 这些类型都实现了迭代器工厂函数 
console.log(str[Symbol.iterator]); // f values() { [native code] } 
console.log(arr[Symbol.iterator]); // f values() { [native code] } 
console.log(map[Symbol.iterator]); // f values() { [native code] } 
console.log(set[Symbol.iterator]); // f values() { [native code] } 
console.log(els[Symbol.iterator]); // f values() { [native code] } 
```

> **:warning:注意：**
>
> Number 和 对象没有实现 Iterable 接口：
>
> ```javascript
> let num = 1; 
> let obj = {}; 
>  
> // 这两种类型没有实现迭代器工厂函数 
> console.log(num[Symbol.iterator]); // undefined 
> console.log(obj[Symbol.iterator]); // undefined 
> ```

调用这个工厂函数会生成一个迭代器 

```javascript
// 调用这个工厂函数会生成一个迭代器 
console.log(str[Symbol.iterator]()); // StringIterator {} 
console.log(arr[Symbol.iterator]()); // ArrayIterator {} 
console.log(map[Symbol.iterator]()); // MapIterator {} 
console.log(set[Symbol.iterator]()); // SetIterator {} 
console.log(els[Symbol.iterator]()); // ArrayIterator {} 
```

实际写代码时， 并不需要显式调用这个工厂函数来生成迭代器。 可迭代对象都有默认的迭代器。

可迭代对象能够进行的操作有：

- `for-of` 循环
- 数组解构
- 扩展操作符
- `Array.from()`
- 创建集合
- 创建映射
- `Promise.all()` 接收由期约组成的可迭代对象
- `Promise.race()` 接收由期约组成的可迭代对象
- `yield*` 操作符， 在生成器中使用

```javascript
let arr = ["foo", "bar", "baz"];

// for-of 循环
for (let el of arr) {
  console.log(el);
}
// foo
// bar
// baz

//数组解构
let [a, b, c] = arr;
console.log(a, b, c); // foo, bar, baz

// 扩展操作符
let arr2 = [...arr];
console.log(arr2); // ['foo','bar','baz']

// Array.from()
let arr3 = Array.from(arr);
console.log(arr3); // ['foo','bar','baz']

// Set构造函数
let set = new Set(arr);
console.log(set); //Set(3) {'foo', 'bar', 'baz'}

// Map 构造函数
let pairs = arr.map((x, i) => [x, i]);
console.log(pairs); // [['foo',0],['bar',1],['baz',2]]
let map = new Map(pairs);
console.log(map); // Map(3) { 'foo'=>0, 'bar'=>1, 'baz'=>2}

// 如果对象原型链上的父类实现了 Iterable 接口， 那这个对象也就实现了这个接口：
class FooArray extends Array{}
let fooArr = new FooArray('foo','bar', 'baz');
for (let el of fooArr){
  console.log(el);
}
// foo
// bar
// baz
```



### 2.3 迭代器协议（iterator）

迭代器是一种一次性使用的对象， 用于迭代与其关联的可迭代对象。
迭代器API 使用 `next()` 方法在可迭代对象中遍历数据。 
每次成功调用`next()` ， 都会返回一个 `IteratorResult` 对象， 其中包含迭代器返回的下一个值。 
若不调用`next()` ， 则无法知道迭代器的当前位置。 

`next() ` 方法返回的迭代器对象 `IteratorResult` 包含两个属性 ： 

- `done` 

  布尔值，表示是否还可以再次调用`next()` 取得下一个值

- `value`

  可迭代对象的下一个值， 或者 `undefined`

```javascript
// 可迭代对象
let arr = ['foo','bar'];

// 迭代器工厂函数
console.log(arr[Symbol.iterator]);// ƒ values() { [native code] }

// 迭代器
let iter = arr[Symbol.iterator]();
console.log(iter); //ArrayIterator{}

// 执行迭代
console.log(iter.next()); // {done:false, value:'foo'}
console.log(iter.next()); // {done:false, value:'bar'}
console.log(iter.next()); // {done:true, value: undefined}
```





## 3. 生成器

