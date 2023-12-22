

[TOC]

> **关于数组Array 的几点回顾**
>
> 1. ”ECMAScript 数组跟其他编程语言的数组有着很大的区别， 跟其他语言中的数组一样，ECMAScript 数组也是一组有序的数据， 但是跟其他语言不同的是， 数组中的每个槽位可以存储任意类型的数据。 这意味着可以创建一个数组，它的第一个元素是字符串，第二个元素是数值，第三个是对象。 ”
> 2. 数组的创建方式有通过构造函数创建和通过字面量创建两个方式。 当通过构造函数创建时,`new` 操作符可以像对象创建一样省略掉。通过构造函数创建时，数组元可以作为参数传入。 但是注意：
>    1. 如果只传入一个数值`n` , 那么会创建一个指定长度`n` 的空数组。
>    2. 和对象一样，在使用数组字面量表示法创建数组时，并不会调用`Array()` 构造函数。
>
> **【拓展：一些奇怪的新东西】**
>
> 1. 数组`length` 属性并不是只读的，通过修改`length` 属性，可以从数组末尾删除或者添加元素。
>
>    ```javascript
>    let arr = [1,2,3];
>    arr.length = 5;
>    console.log(arr) ;//[1,2,3,empty × 2]
>    console.log(arr[4]); // undefined
>    
>    arr.length = 1;
>    console.log(arr); // [1]
>    ```
>
> 2. ES6规范对数组中的空位进行了重新定义， 数组 [1,2,,,,,3] 中间逗号的值如若为空， 其访问值则为`undefined` ，但是，也会因为不同的方法，访问值存在差异，如`join` 会视其为空串。
>
>    ```javascript
>    [1,,,,5].join('-'); // "1----5"
>    ```
>
>    `map`会直接跳过:
>
>    ```javascript
>    [1,,,,5].map(()=>6));// [6, undefined,undefined,undefined,6]
>    ```
>
>    所以为了避免行为不一致以及考虑到存在性能隐患，要避免使用空位数组，如果确实需要，则显式用`undefined`填充。 
>
> 3. 如果给在一个数组超出当前数组长度的索引位上新增一个元素，那么中间会自动用空值填充，数组长度也会发生变化：
>
>    ```javascript
>    let arr = [1,2,3]
>    arr[100] = 4;
>    console.log(arr);// [1, 2, 3, empty × 97, 4]
>    ```
>
> 



## 1. **<span style="color:red">Array 构造函数</span>**有两个ES6 新增的**用于创建数组的**静态方法：

- `from()` : 用于将**类数组结构**转换为**数组实例**。

  > `Array.from()` 的第一个参数时一个类数组对象，即任何可迭代的结构，或者有一个`length`属性和可索引元素的结构。

- `of()` ：将**一组参数**转换为**数组实例**。



### 1.1  `Array.from()`

**<span style="color:red">[ES6]:</span>**`Array.from()` 构造函数静态方法，用于将**类数组结构**转换为**数组实例**。

**示例1：**

```javascript
// 将字符串转为数组
console.log(Array.from("Matt"));//["M","a","t","t"]
```

**示例2：**

```javascript
// 将集合和映射转换为一个新数组
const m = new Map().set(1,2).set(3,4);
const s = new Set().add(1).add(2).add(3).add(4);

console.log(Array.from(m));// [[1,2],[3,4]]
console.log(Array.from(s));// [1,2,3,4]
```

**示例3：**

```javascript
// 可以使用任何可迭代对象
const iter = {
    *[Symbol.iterator](){
        yield 1;
        yield 2;
        yield 3;
        yield 4;
    }
}
console.log(Array.from(iter)); // [1,2,3,4]
```

**示例4：**

```javascript
// 对现有数组执行浅复制
const a1 = [1,2,3,4];
const a2 = Array.from(a1);

console.log(a1); //[1,2,3,4];
console.log(a1 === a2);// false
```

**示例5：**

```javascript
// 可以将函数参数对象arguments 转换为数组
function getArgsArray(){
    return Array.from(arguments);
}
console.log(getArgsArray(1,2,3,4)); // [1, 2, 3, 4]
```

**示例6：**

```javascript
// 转换带有必要属性的自定义对象
const arrayLikeObject = {
    0 : 1,
    1 : 2,
    2 : 3,
    3 : 4,
    length : 4
};
console.log(Array.from(arrayLikeObject)); // [1, 2, 3, 4]
```



`Array.from()` 还接收第二个可选的映射函数参数。 这个函数可以直接增强新数组的值，而无需像调用`Array.from().map()` 那样先创建一个中间数组。 还可以接收第三个可选参数， 用于指定映射函数中的`this` 的值。但是这个重写的`this` 值在箭头函数中不适用。 

示例：

```javascript
const a1 = [1,2,3,4];
const a2 = Array.from(a1, x => x**2);
const a3 = Array.from(a1, function(x){ return x**this.exponent},{exponent:2});
console.log(a2); // [1,4,9,16]
console.log(a3); // [1,4,9,16]
```







### 1.2  `Array.of()`

**<span style="color:red">[ES6]:</span>**`Array.of()`将**一组参数**转换为**数组实例**。

`Array.of()` 用于替代在ES6 之前常用的`Array.prototype.slice.call(arguments)`, 一种异常笨拙的将`arguments` 对象转换为数组的写法：

```javascript
console.log(Array.of(1,2,3,4)); // [1,2,3,4]
console.log(Array.of(undefined)); // [undefined]
```







## 2. `Array.isArray()`

1. 判断是否为数组 ：**<span style="color:red">[ES6]:</span>** `Array.isArray()`

   > 使用`instanceof` 的问题在于，要先假定只有一个全局执行上下文。 如果网页中有多个框架，则可能涉及两个不同的全局执行上下文，因此就会有两个不同版本的Array 构造函数。 如果要把数组从一个框架传给另一个框架，则这个数组的构造函数将会有别于在第二个框架内本地创建的数组。 

   `Array.isArray()` 方法的目的就是确定一个值是否为数组，而不用管它是在哪个全局执行上下文中创建的。 

   

## 3. 迭代器方法：`keys()`, `values()`,`entries()`

1. **<span style="color:red">[ES6]:</span>**`keys()` : 返回数组索引的迭代器，
2. **<span style="color:red">[ES6]:</span>**`values()` ：返回数组元素的迭代器，
3. **<span style="color:red">[ES6]:</span>**`entries()` ：返回 key/value 键值对的迭代器

```javascript
const a = ["foo", "bar", "baz", "qux"];

const aKeys = Array.from(a.keys());// [0, 1, 2, 3]
const aValues = Array.from(a.values()); // ["foo", "bar", "baz", "qux"]
const aEntries = Array.from(a.entries()); // [[0,"foo"],[1,"bar"],[2,"baz"],[3,"qux"]]
```

> 因为这些方法都返回迭代器， 所以可以将它们的内容通过`Array.from()` 直接转换为数组示例。
>
> 另外，使用ES6 的结构，可以非常容易地在循环中拆分键值对：
>
> ```javascript
> const a = ["foo", "bar", "baz", "qux"];
> for (const [idx, element] of a.entries()){
>     alert(idx);
>     alert(element);
> }
> //0
> //foo
> //1
> //bar
> //2 
> //baz
> //3
> //qux
> ```



## 4. 复制和填充方法 `copyWith()`, `fill()`

### 4.1 **<span style="color:red">[ES6]:</span>**`fill()`

```javascript
//Syntax
fill(value)
fill(value, start)
fill(value, start, end)
```

用于填充数组：

```javascript
let arr = new Array(10);
arr.fill("hello");

console.log(arr);
//["hello","hello","hello","hello","hello","hello","hello","hello","hello","hello",];

arr.fill("world", 5);

console.log(arr);
//["hello","hello","hello","hello","hello","world","world","world","world","world",];

arr.fill("jay", 3, 6);

console.log(arr);
//["hello","hello","hello","jay","jay","jay","world","world","world","world"]
```



### 4.2 **<span style="color:red">[ES6]:</span>**`copyWith()`

按照指定范围<span style="color:red">**浅复制**</span>数组中的部分内容，然后将他们插入到指定索引开始的位置。

```javascript
//Syntax
copyWithin(target)
copyWithin(target, start)
copyWithin(target, start, end)
```

```javascript
let arr = [1, true, "hello world", { name: "jayce" }];
arr.copyWithin(0, 2);
console.log(arr, "--line3");
//
[
  "hello world",
  {
    name: "jayce",
  },
  "hello world",
  {
    name: "jayce",
  },
];
arr[0] = "JavaScript NB!";
arr[1].name = "frank";
console.log(arr, "--line16");
//
[
  "JavaScript NB!",
  {
      "name": "frank"
  },
  "hello world",
  {
      "name": "frank"
  }
]
```



## 5. 栈方法 `push()` 和 `pop()`

> 栈是一种后进先出（LIFO, Last-In-First-Out） 的结构，数据项的推入和删除只在栈的顶部发生。 

```javascript
let colors = [];
let count = colors.push("red","green");// 2
let count1 = colors.push("yellow"); //3
let count2 = colors.pop();// "green"
let count3 = colors.pop();// "red"
```

> 注意,`push()` 和 `pop()` 方法都是有返回值的， 前者返回数组长度， 后者返回被删去的元素本身。

## 6. 队列方法 `shift()` 和 `unshift()`

> 队列以先进先出的形式限制访问 （FIFO, First-In-First-Out）

```javascript
let list  = [1,2,3,4,5,6];
list.unshift("a","b","c"); // 有返回值 ：9
console.log(list)
// ['a', 'b', 'c', 1, 2, 3, 4, 5, 6]
list.shift(); //'a'
list.shift(); //'b'
list.shift(); //'c'
console.log(list)
// [1, 2, 3, 4, 5, 6]
```

## 7. 排序方法 `reverse()` 和 `sort()`

### 7.1 `reverse()` 

`reverse()` 方法用于将数组元素反向排列。

```javascript
let values = ["a","b","c"];
values.reverse();
console.log(values); // ['c', 'b', 'a']
```

```javascript
let values = [1,2,3,4,5];
values.reverse();
console.log(values);// [5,4,3,2,1]
```

> 注意:warning: `reverse()` 方法可以直接用于处理String 或者Number数组， 如果是String 数组，则按照字母排序。 

### 7.2 `sort()` 

`sort()` 方法不同于`reverse()` ,`sort()` 会在每一项上调用`String()` 转型函数。然后去按照升序排序字符串。

```javascript
let values =  [0, 1, 5, 10, 15];
values.sort();
alert(values); // 0,1,10,15,5
```

> 注意:warning: 也就是说，`sort()` 方法不能直接用于数字排序。 

`sort()` 方法，能够接收一个 **比较函数** ， 用于判断哪个值应该排在前面。 

比较函数接收两个参数， 入股过第一个参数应该排在第二个参数前面，就返回负值； 如果两个参数相等，就返回0； 如果第一个参数应该排在第二个参数后面， 就返回正值。

```javascript
function compare(a,b){
 return a < b ? -1 : a > b ? 1 : 0
}
let values =  [ 5, 10, 0, 1,15];
let res = values.sort(compare);
console.log(res);		// [0, 1, 5, 10, 15]
console.log(values); 	// [0, 1, 5, 10, 15]
```

> :star2: 注意：`reverse()` 和 `sort()` 都返回调用它们的数组的引用。所以上例中，执行完毕res 和 values 是相同的。  
>
> ```javascript
> values === res; // true
> ```



## 8. 操作方法

### 8.1 `concat()` 与 "数组参数的打平"

向一个数组末尾拼接一个或者多个元素，或者数组。 

```javascript
let color2 = ["red","green","blue"].concat("yellow",["black","brown"]);
// ["red", "green", "blue", "yellow", "black", "brown"] 
```

**<span style="color:red">[ES6]:</span>**

默认的， 如果`concat()` 方法的参数中，含有数组， 那么将会该参数数组的元素取出然后逐个添加到目标数组。 这个过程被称作 “打平数组参数”。 

但是ES6 中，支持了重写该默认行为， 也就是可以不让它打平，方法就是在参数数组上指定一个特殊的符号：`Symbol.isConcatSpreadable`如下例：

```javascript
let target = ["red","green","blue"];
let param2 = ["black","brown"];
param2[Symbol.isConcatSpreadable] = false;
let res = target.concat("yellow",param2);
console.log(res);//["red","green","blue","yellow",["black","brown"]]
```

这样，作为参数传入的数组，就会被作为单独的一个元素添加到目标数组，而不会拆开（打平）



**强制打平类数组对象**

虽然对于数组而言，默认的是会打平，但是，对于类数组对象，默认是不会打平的，但是还可以显式的设定以强制打平类数组对象。

```javascript
let target =  ["red","green","blue"];
let param2 = {
    length:2,
	0: "pink",
    1: "cyan"
}
let res =  target.concat("yellow",param2);
console.log(res);//
[
    "red",
    "green",
    "blue",
    "yellow",
    {
        "0": "pink",
        "1": "cyan",
        "length": 2
    }
]
```

可见，对于类数组元素，默认是不会的， 所以可以通过`[Symbol.isConcatSpreadable]` 属性，将其置为`true` 就可以**实现强制打平**了。

```javascript
let target =  ["red","green","blue"];
let param2 = {
    [Symbol.isConcatSpreadable] : true,
    length:2,
	0: "pink",
    1: "cyan"
}
let res =  target.concat("yellow",param2);
console.log(res);//['red', 'green', 'blue', 'yellow', 'pink', 'cyan']
```

以上写法等同于：

```javascript
let target =  ["red","green","blue"];
let param2 = {
    length:2,
	0: "pink",
    1: "cyan"
}
param2[Symbol.isConcatSpreadable] = true;
let res =  target.concat("yellow",param2);
console.log(res);//['red', 'green', 'blue', 'yellow', 'pink', 'cyan']
```



### 8.2 更多方法

#### 8.2.1 `slice()` ：

用于创建包含原有数组中一个或者多个元素的**新数组**。接收一个或两个参数，如果只有一个参数，返回该索引到数组末尾的所有元素。 

> `silce()` 方法有一个特点，就是如果有两个参数，则返回的数组中不包含结束索引对应的元素。 即范围的起始点索引对应元素会包含在内，结束点索引对应元素不包含在内。 
>
> :warning: **这里有一个非常值得注意的点**，如果你企图使用该方法去实现 数组的复制， 那么结果将会是一个**浅拷贝**数组。 
>
> ```javascript
> let arr = ["hello world", 1, { name: "jayce" }];
> let copy = arr.slice(0, arr.length);
> arr[2].name = "frank";
> console.log(arr, "--line5");//["hello world",1,{"name": "frank"}]
> console.log(copy, "--line6");//["hello world",1,{"name": "frank"}]
> console.log(arr === copy, "--line7");       //false
> console.log(arr[0] === copy[0], "--line8"); //true
> console.log(arr[1] === copy[1], "--line9"); //true
> console.log(arr[2] === copy[2], "--line10");//true
> ```
>
> 详细的描述一下这个过程。
>
> 首先关于全等于(Strict equality),务必知道它有以下规则：
>
> > [Description](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality#description)
> >
> > The strict equality operators (`===` and `!==`) use the [Strict Equality Comparison Algorithm](https://www.ecma-international.org/ecma-262/5.1/#sec-11.9.6) to compare two operands.
> >
> > - <span style="color:red">If the operands are of different types, return `false`.</span>
> > - <span style="color:red">If both operands are objects, return `true` only if they refer to the same object.</span>
> > - If both operands are `null` or both operands are `undefined`, return `true`.
> > - If either operand is `NaN`, return `false`.
> > - Otherwise, compare the two operand's values:
> >   - Numbers must have the same numeric values. `+0` and `-0` are considered to be the same value.
> >   - Strings must have the same characters in the same order.
> >   - Booleans must be both `true` or both `false`.
> >
> > The most notable difference between this operator and the [equality](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality) (`==`) operator is that if the operands are of different types, the `==` operator attempts to convert them to the same type before comparing.
>
> 最关键的， 如果判断目标是引用值类型，则必须是同一个引用值，才会返回`true` ,即二者的内存地址必须一样。
>
> 对于非引用值类型，需要字面量和值类型一致才会返回`true`。
>
> 以上示例中，由于是浅拷贝，因此，数组中第三个元素作为引用类型，只会拷贝其引用地址，所以在`arr[2].name = "frank"` 执行以后， 修改`arr` 中该对象的`name` 属性，`copy` 中的对象也会改变。 也正是因为这个原因，所以l--line10 的返回值为`true` ， 至于line8,line9 ,则是按照基本值类型去判断全等于。 注意， 深浅拷贝是就引用类型而言的。 
>
> 至于line7 返回了 `false` ， 为什么`arr` 和 `copy` 的元素全都全等， 但是两个数组对象本身却不全等呢？  这是由于`slice()` 方法，返回一个”浅拷贝的新数组“ ， 在`slice()` 方法的背后， 实际上是，先声明一个新的变量`copy`, 然后对`arr`执行`slice()` 方法后，把结果赋值给这个名为`copy` 的新数组（将执行所返回的对象关联到`copy` 的引用地址）
>
> 如果想要加以验证也简单， 向`arr` 中添加/删除 元素，`copy` 中将不受影响。 

#### 8.2.2 `splice()` : 

这是一个强大的数组方法

其主要的目的是在数组中间插入元素，但是有三种不同的方式去使用该方法，以达到不同的效果。

- **删除** : `splice(start,count)` , 分别传入要删除的起始索引，要删除的元素个数；

- **插入**：`splice(start,0,el1,el2,...)`, 分别传入，插入的起始索引，删除0个元素，要插入的元素

  ```javascript
  splice(2,0,"red","green")
  ```

- **替换**：`splice(start,n,el1,el2,...n个元素)`, 分别传入，起始位置，删除的个数，然后用相等的个数填充，就达到了替换的目的。

## 9. 搜索 和 位置方法

### 9.1 严格相等 `indexOf()`, `lastIndexOf()`, `includes()`

- `indexOf(target,start)` ： 第二个参数可选，从前向后查找，返回目标元素的索引值，找不到则返回`-1`。
- `lastIndexOf(target.start)`:第二个参数可选，从后向前查找，返回目标元素的索引值，找不到则返回`-1`。
- **<span style="color:red">[ES6]:</span>** `includes()`: 返回布尔值

### 9.2 **断言函数** `find()`, `findIndex()` :

ECMAScript 允许按照定义的断言函数搜索数组，每个索引都会调用这个函数。 断言函数的返回值决定了相应索引的元素是否被认为匹配。 

断言函数接收三个参数 ： 元素、 索引、 数组本身

- **<span style="color:red">[ES6]:</span>**`find()` ：从数组的最小索引开始，<u>返回第一个匹配</u> 的元素。

- **<span style="color:red">[ES6]:</span>**`findIndex()`：从数组的最小索引开始，<u>返回第一个匹配</u> 的元素的索引。

  ```javascript
  const people = [{name:'matt',age:27},{name:'Nicholas',age:29}];
  alert(people.find((element, index, array) => element.age < 28)); // {name:'matt',age:27}
  alert(people.findIndex((element, index, array) => element.age < 28)); // 0
  ```

  

## 10. 迭代方法 `every()`, `some()`, `filter()`, `forEach()`, `map()`

ECMAScript 为数组定义了5个迭代方法，每个方法接收两个参数： 以每一项为参数运行的函数，以及可选的作为函数运行上下文的作用域对象（影响函数中的`this `值）。 传给每个方法的函数接收 3 个参数 ： 数组元素、 元素索引、 数组本身。

1. `every()` ：对数组每一项都运行传入的函数，如果对每一项函数都返回`true`， 则这个方法返回`true`。

2. `some()` ：对数组每一项都运行传入的函数， 如果有一项函数返回`true` ， 则这个方法返回`true`.

   ```javascript
   let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
   let everyResult = numbers.every((item, index, array) => item > 2);
   console.log(everyResult);//false
   let someResult = numbers.some((itme, index, array)=> item > 2);
   console.log(someResult);// true
   ```

   `some()` 和 `every()` 很相似， 但是其区别从字面意思上也容易区分。 一个是执行函数需要所有元素都满足才会返回`true`， 另一个是只要有一个元素满足就会返回`true` 。

3. `filter()` : 对数组的每一项都运行传入的函数，函数返回`true` 的项会组成数组后返回。 

   ```javascript
   let numbers = [1, 2, 3, 4, 5, 4, 3, 2, 1];
   let filterResult = numbers.filter((item, index, array) => item > 2);
   console.log(filterResult); // [3,4,5,4,3]
   ```

4. `forEach()` ：对数组每一项都运行传入的函数，**没有返回值**。

5. `map()` ： 对数组每一项都运行传入的函数， 如果有一项函数返回`true` 。 则这个方法返回`true`。

**以上这些方法，都不改变调用他们的数组。 **





## 11. 归并方法 `reduce()`, `reduceRight()`

ECMAScript 为数组提供了两个归并方法：`reduce()`, `reduceRight()`  。
这两个方法都会迭代数组的所有项， 并在此基础上否建一个最终返回值。`reduce()` 方法从数组的第一项开始遍历到最后一项。 `reduceRight()` 则相反 。

<u>这两个方法</u>都接收两个参数： 对每一项都会运行的**归并函数**， 以及**可选的**以之为**归并起点**的初始值。 传给`reduce()` 和`reduceRight()` 的参数函数（callback 函数）接收四个参数： 上一个归并值、 当前项、 当前项的索引、 数组本身。 这个函数返回的任何值都会作为下一次调用同一个函数的第一个参数。 如果没有给<u>这两个方法</u>传入可选的第二个参数（作为归并起点值），则第一次迭代将从数组的第二项开始，因此传给归并函数的第一个参数是数组的第一项，第二个参数是数组的第二项。

```javascript
let values = [1, 2, 3, 4, 5];
let sum = values.reduce((prev, cur, index, array)=> prev + cur);
console.log(sum);// 15
```

第一次执行归并函数时，`prev` 是 1，`cur` 是2;
第二次执行时，`prev` 是 3 （1+2），`cur` 是 3；
...
`reduceRight()` 方法类似，只是方向相反。

```javascript
let values = [1, 2, 3, 4, 5];
let sum = values.reduceRight(function(prev, cur, index, array){
    return prev + cur;
});
console.log(sum);// 15
```

第一次执行归并函数时，`prev` 是 5，`cur` 是 4；
第二次执行时，`prev` 是 9(5+4), `cur` 是 3;
...

