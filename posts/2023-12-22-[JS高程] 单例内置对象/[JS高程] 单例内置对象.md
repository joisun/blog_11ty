[toc]

## 1. 单例内置对象

所谓单例内置对象，是指由ECMAScript 实现提供的对象，与宿主环境无关。 不用显式的实例化内置对象。处理常见的Object、Array、String , 还有两个单例内置对象，Global 和 Math。



### 1.2 Global

事实上，不存在全局变量或者全局函数这种东西。  在全局作用域中定义的变量和函数都会变成Global对象的属性。 



#### 1.2.1 常见的Global 对象方法

常见的有 ：

- `isNaN()`
- `isFinate()`
- `parseInt()`
- `parseFloat()`

除此外，还有：



1. URL编码方法

   1. `encodeURI()`

   2. `encodeURIComponent()`

      > `encodeURI()`方法会将URI 中空格转译：
      >
      > ```javascript
      > let uri = "http://www.wrox.com/illegal value.js#start";
      > console.log(encodeURI(uri));
      > // "http://www.wrox.com/illegal%20value.js#start" 
      > ```
      >
      > `encodeURIComponent()` 方法则会编码所有它发现的非标准字符。 
      >
      > ```javascript
      > console.log(encodeURIComponent(uri)); 
      > // "http%3A%2F%2Fwww.wrox.com%2Fillegal%20value.js%23start" 
      > ```

   通常的做法是使用`encodeURI()` 去编码整个URI， 但是，只使用`encodeURLComponent()` 去编译哪些会追加到以后URI后面的字符串。

2. URL解码方法

   1. `decodeURI()`

   2. `decodeURIComponent()`

      > `decodeURI()` 只对使用`encodeURI()` 编码过的字符解码，`decodeURIComponent()` 解码所有被`encodeURIComponent()` 编码过的字符。

3. `eval()` 方法

   这个方法是一个完整的ECMAScript解释器， 它接受一个参数，一个ECMAScript 字符串。

   ```javascript
   eval("console.log('hi')");
   //等价于
   console.log("hi")
   ```

   通过`eval()` 方法执行的代码属于该调用所在的上下文，被执行的代码与该上下文拥有相同的作用域链。 这意味着定义在包含上下文中的变量可以在`eval()` 调用内部被引用。

   ```javascript
   let msg = "hello world";
   eval("console.log(msg)"); // "hello world"
   ```

   通过`eval()`定义的任何变量和函数都不会被提升， 这是因为在解析代码的时候，他们是被包含在一个字符串中的。他们只是在`eval()` 执行的时候才会被创建。

   严格模式下，`eval()` 内部创建的变量和函数无法被外部访问。



#### 1.2.2 Global 对象属性

特殊值如`undefined`, `NaN`, `Infinity` 等，都是`Global` 对象的属性。 此外， 所有原生引用类型构造函数，比如`Object`， `Function`， `Boolean` , `String`, `Number ` 等等，都是Global 对象的属性。 

下表列出了所有这些属性，

| 属性             | 说明     |
| :--------------- | :------- |
| `undefined`      | 特殊值   |
| `NaN`            | 特殊值   |
| `Infinity`       | 特殊值   |
| `Object`         | 构造函数 |
| `Array`          | 构造函数 |
| `Function`       | 构造函数 |
| `Boolean`        | 构造函数 |
| `String`         | 构造函数 |
| `Number`         | 构造函数 |
| `Date`           | 构造函数 |
| `RegExp`         | 构造函数 |
| `Symbol`         | 构造函数 |
| `Error`          | 构造函数 |
| `EvalError`      | 构造函数 |
| `RangeError`     | 构造函数 |
| `ReferenceError` | 构造函数 |
| `SyntaxError`    | 构造函数 |
| `TypeError`      | 构造函数 |
| `URIError`       | 构造函数 |



以上这些对象属性，很多都非常熟悉，但是通常只知道是window 对象提供的。 这是因为`window` 对象实际上是`Global` 对象的代理。  而ECMAScript 并没有规定直接方位Global 对象的方式。 

在浏览器为宿主环境中：

```javascript
this === window
window === globalThis
this === globalThis
```

注意以上判断不能简写为`this === window === globalThis`

因为`this === window` 返回 `true` ,但是 `true` 并不全等于`globalThis`



在node环境中

```javascript
this === globalThis
```



#### 1.2.3 window 对象

`window` 对象 在 JavaScript 中远远不止实现了ECMAScript 的 Global 对象那么简单。 这里不做详细介绍 高程12章有详解。 





### 1.3 Math 

单例内置对象除了Global 之外，还有一个就是`Math`

#### 1.3.1 对象属性

Math 对象有一些属性，用于保存数学中的一些特殊值 如`Math.PI` , `Math.E` 等 。 这里略。

#### 1.3.2 常用对象方法

`Math` 对象有大量关于数学计算的方法。 这里仅提及少数常用方法。 

1. `min()` ， `max()` 方法

   ```javascript
   //eg1:
   let max = Math.max(2,43,32,14);// 54
   //eg2:
   let values = [1,2,3,4,5,5,6,7,8];
   let max2 = Math.max(...values);
   ```

2. 舍入方法

   1. `Math.ceil()` : 始终向上舍入为最接近的整数

      ```javascript
      Math.ceil(25.9);//26
      Math.ceil(25.1);///26
      ```

   2. `Math.floor()` ：始终向下舍入为最接近的整数

      ```javascript
      Math.floor(25.9);//25
      Math.floor(25.1);//25
      ```

   3. `Math.round() ` : 执行四舍五入

      ```javascript
      Math.round(25.9);//26
      Math.round(25.1);//25
      ```

   4. `Math.fround()` ： 返回数值最接近的单精度(32位）浮点值表示。 

      ```javascript
      Math.fround(0.4);  // 0.4000000059604645 
      Math.fround(0.5);  // 0.5 
      Math.fround(25.9); // 25.899999618530273
      ```

3. `random()` 方法

   `Math.random()` 方法返回一个 0~1 范围的随机数。  注意： **包括0， 但不包括1**。

4. 其他方法，还有很多方法

   - `Math.abs(x)` ： 返回x的绝对值。
   - `Math.pow(a,b)` : 返回 a 的 b 次方
   - `Math.sqrt(x)` : 返回 x 的平方根
   - 等等....







**小结：**

当代码开始执行时，全局上下文中会存在两个内置对象： Global 和 Math。 其中，Global 对象在大多数ECMAScript 实现中无法直接访问。 不过，浏览器将其实现为window 对象。 所有全局变量和函数都是Global 对象的属性。 Math 对象包含辅助玩策划给复杂计算的属性和方法。 