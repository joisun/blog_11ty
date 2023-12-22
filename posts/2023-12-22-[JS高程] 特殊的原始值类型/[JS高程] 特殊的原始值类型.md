## 原始值包装类型 （特殊引用类型）

在ES6 时，ECMAScript 数据类型是这样去分类的：

- 原始值（基本数据类型）

  - Number
  - String
  - Boolean
  - Undefined
  - Null
  - Symbol

- 引用值（复杂数据类型）

  - Object

    > 函数也是一种引用类型



且我们知道，通常情况下，只有对象才有方法。但是我们知道，实际上，字符串有字符串方法，如：

- `indexOf() `, `lastIndexOf()`
- `search()`
- `slice()`, `substring()`, `substr()`
- `replace()`
- `toUpperCase()`, `toLowerCase()`
- `concat()`
- `trim()` 
- 等等...

Number 有Number 方法，如：

- `toExponential()`
- `toFixed()`
- `toPrecision() `
- 等等...

Boolean 有 Boolean 方法，如：

- `toString()`
- `valueOf()`





这些都是基本的数据类型， 但是却有着对象的方法。 

实际上，ECMAScript 为了方便的操作原始值，提供了3中 **特殊的引用类型** : 

1. Boolean
2. Number
3. String



```javascript
let s1 = "some text";
let s2 = s1.substring(2);
```

这里，第二行在访问`s1` 的时候，是以读模式访问的。 也就是要从内存中读取变量保存的值， 以读模式访问字符串值的任何时候，**后台**都会执行以下3个步骤：

1. 创建一个String类型的实例；
2. 调用实例上的特定方法；
3. 销毁实例。

```javascript
let s1 = new String("some text");
let s2 = s1.substring(2);
s1 = null;
```



布尔值和数值也是一样的， 以上3步也会在后台发生，不过使用的是Boolean 和 Number 包装类型而已 。



这三种特殊的引用类型，也叫做原始值包装类型。 



### 原始值包装类型和应用类型的区别

引用类型与原始包装类型的主要区别在于对象的生命周期。 在通过`new` 实例化引用类型后。 得到的实例会在离开作用域时被销毁，而自创建的原始值包装对象则只存在于访问它的那行代码执行期间。 这也为之不能在运行时给原始值添加属性和方法。 

```javascript
let s1 = "some text";
s1.color = "red"; // 创建临时String 对象，并在执行完该行后立即被销毁。
console.log(s1.color);// undefined
```

> 不过如果真的期望达到给一个原始值添加属性。 可以显式的去调用 `new Boolean()` 、`new Number()` 、 `new String()` 这些构造函数以创建原始值包装对象。 
>
> 有几点值得注意：
>
> 1. 不推荐使用， 因为会让开发者容易疑惑。
>
> 2. 在<u>原始值包装类型</u>的实例上使用 `typeof` 会返回 "object" 
>
>    ```javascript
>    let objNumb = new Number(100);
>    let objStr = new String("some text");
>    let objBool = new Boolean(true);
>    
>    typeof objNumb; //'object'
>    typeof objStr;  //'object'
>    typeof objBool; //'object'
>    ```
>
> 3. 通过<u>原始值包装类型</u>构造函数显式的实例化对象 都是 对应<u>原始值包装类型</u>的实例
>
>    ```javascript
>    objNumb instanceof Number;	// true
>    objStr instanceof String; 	// true
>    objBool instanceof Boolean;	// true
>    ```
>
> 4. 通过工厂方法 `Object`构造函数，也能够根据传入值的类型返回相应<u>原始值包装类型</u>的实例
>
>    ```javascript
>    let Ostr = new Object("some text");
>    let Onum = new Object(100);
>    let Obool = new Object(false);
>    
>    Ostr instanceof String;		// true
>    Onum instanceof Number;		// true
>    Obool instanceof Boolean;	// true
>    ```









### 



## 