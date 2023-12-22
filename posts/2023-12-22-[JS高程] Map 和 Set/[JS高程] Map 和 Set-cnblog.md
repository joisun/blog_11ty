[toc]

## 1. Map

Map 是ES6新增的一种集合类型， 为这么语言带来了真正的 key/value 存储机制。译作 “映射”

### 1.2 基本API

#### 1.2.1 Map 实例的创建

使用`new` 关键字 和 `Map` 构造函数 以创建一个Map实例， 也叫做一个映射。

```javascript
// 创建一个 空映射
const m = new Map();
```

**初始化创建**

需要给构造函数传入一个 **可迭代** 对象， 需要包含 **键值对 数组**。  可迭代对象种的每个键/值 对都会按照迭代顺序插入到新映射实例中：

```javascript
// 使用嵌套数组初始化映射
const m1 = new Map([
    ["key1", "val1"],
    ["key2", "val2"],
    ["key3", "val3"],    
]);
alert(m1.size);// 3
```

```javascript
// 使用自定义迭代器初始化映射
const m2 = new Map({
    [Symbol.iterator]: function* (){
        yield ["key1", "val1"];
        yield ["key2", "val2"];
        yield ["key3", "val3"];
    }
});
alert(m2.size);// 3
```



#### 1.2.2 Map 实例属性

- `size` ：返回映射中键值对的个数；

#### 1.2.3 Map 实例方法

- `set()` : 添加键/值对, 返回一个携带新键值对的映射实例；
- `get()` : 携key 获取value;
- `has()` : 查询key是否存在， 返回布尔值；
- `delete()` : 删除；
- `clear()` : 清除映射实例中的所有键值对；

```javascript
const m = new Map();
m.set("firstName","Matt").set("lastName","Frisbie");
m.size; // 2

m.get("lastName"); 		// 'Frisbie'
m.set("lastName","Frank"); // Map(2) {'firstName' => 'Matt', 'lastName' => 'Frank'}
m.get("lastName"); 		// 'Frank'

m.has("firstName"); 	//true
m.delete("firstName")	//true, 表示操作成功
m.has("firstName");		//false

m.clear() //undefined 
```

:warning:注意： 

1. 对空映射判断`undefined` 也是能够如期执行的：

   ```javascript
   const m3 = new Map([[]]);
   alert(m2.has(undefined));// true
   alert(m2.get(undefined));// undefined
   ```

2. 和 Object 只能用 数值、字符串、 符号作为键不同， **<u>Map 可以使用任何JavaScript 数据类型作为键</u>**。 Map 内部相当于**使用使用严格对象相等的检查键的匹配性**。 和Object 类似，值是没有限制的。 

   ```javascript
   const m = new Map();
   
   const functionKey = function(){};
   const symbolKey = Symbol();
   const objectKey = new Object();
   
   m.set(functionKey,"functionValue");
   m.set(symbolKey,"symbolValue");
   m.set(objectKey,"objectValue");
   
   alert(m.get(functionKey)); //functionValue
   alert(m.get(symbolKey)); //symbolValue
   alert(m.get(objectKey)); //objectValue
   
   alert(m.get(function() {})); // undefined
   ```

   > :star: 最后一行执行结果为`undefied`, 正式因为严格相等， 对于引用类型值作为映射的key, 可以理解为实际上将其内存地址的引用作为key。 而`m.get(function() {})` 中的 函数是新声明的， 所以其内存地址引用必不可能和在定义`const functionKey = function(){}` 时的引用相同。 

#### 1.2.4 顺序与迭代

##### 1.2.4.1 使用迭代器迭代映射实例

**与Object类型的一个主要差异是，Map 实例会维护键值对的插入顺序**， 因此可以根据插入顺序执行迭代操作。 

映射实例， 可以提供一个迭代器（Iterator） , 能够以插入顺序生成 `[key, value]` 形式的数组。 可以通过`entries()` 方法取得这个迭代器（也可以使用`Symbol.iterator` 这个属性函数， 它引用`entries()`）。  

```javascript
const m = new Map([
    ["key1", "val1"],
    ["key2", "val2"],
    ["key3", "val3"]
]);

alert(m.entries === m[Symbol.iterator]); //true

for (let pair of m.entries()){
    alert(pair);
}
// [key1,val1]
// [key2,val2]
// [key3,val3]

for (let pair of m[Symbol.iterator]()){
    alert(pair)
}
// [key1,val1]
// [key2,val2]
// [key3,val3]
```



**实际上，`entries()` 是默认的迭代器，所以其实可以直接操作映射实例**

上面，显式的去通过`entries()` 或者 `[Symbol.iterator]()` 去使用映射实例的迭代器迭代键值对。 

实际上，也可以直接对实例本身操作，因为`entries()` 是映射实例的默认迭代器。

```javascript
const m = new Map([
    ["key1", "val1"],
    ["key2", "val2"],
    ["key3", "val3"]
]);
for (let pair of m{
    alert(pair);
}
// [key1,val1]
// [key2,val2]
// [key3,val3]
```

也可以直接对其使用**扩展操作**， 把映射转换为数组：

```javascript
const m = new Map([
    ["key1", "val1"],
    ["key2", "val2"],
    ["key3", "val3"]
]);
console.log([...m]); //[["key1","val1"],["key2","val2"],["key3","val3"]]
```

> :warning: 注意：
>
> 键和值，在迭代器遍历的时候是可以改变的，但是，由于键和值都可以是任意数据类型， 存在两种情况：
>
> 1. 如果键值是引用类型，那么只要不改变其对内存的地址引用即可；
>
>    ```javascript
>    const m = new Map([[{ name: "Jayce" }, "val1"]]);
>    for (let key of m.keys()) {
>      key.name = "Frank";
>      alert(m.get(key)); // val1;
>      alert(key.name); // Frank
>    }
>          
>    console.log([...m][0][0]); //{name: 'Frank'}
>    ```
>
>    
>
> 2. 如果是原始值作为键值， 则不能被修改 。 
>
>    ```javascript
>    const m = new Map([["key1", "val1"]]);
>    for (let key of m.keys()) {
>      key = "newKey";
>      alert(m.get("key1")); // val1;
>      alert(m.get("newKey")); // undefined
>    }
>    ```
>
> 3. :star:对于Map 来讲，有key 组成的迭代器，有value 组成的迭代器，还有键值对组成的迭代器`entries()`, 还有 `entries()` 的引用 `[Symbol.iterator]`
>
>    ```javascript
>    const m = new Map([
>      ["key1", "val1"],
>      ["key2", "val2"],
>    ]);
>    console.log(m.values()); //MapIterator {'val1', 'val2'}
>    console.log(m.keys()); //MapIterator {'key1', 'key2'}
>    console.log(m.entries()); //MapIterator {'key1' => 'val1', 'key2' => 'val2'}
>    console.log(m.entries === m[Symbol.iterator]); // 迭代器函数是同一个
>    console.log(m.entries() === m[Symbol.iterator]()); // false  ， 每次迭代器的返回值都是不同的
>    console.log(m[Symbol.iterator]() === m[Symbol.iterator]()); // false ， 验证
>    ```
>
>    

##### 1.2.4.2 不使用迭代器，使用回调迭代

像数组一样，映射也提供了实例方法`forEach(callback, opt_thisArg)` ,

```javascript
const m = new Map([
    ["key1", "val1"],
    ["key2", "val2"],
    ["key3", "val3"]
]);
m.forEach((val,key)=>alert(`${key} -> ${val}`));
// key1 -> val1 
// key2 -> val2 
// key3 -> val3
```

> :warning: 注意：
>
> 该方法名和普通数组的`forEach()` 方法是一样的，但是其callback 函数的参数不同于普通数组的`forEach()` 方法：
>
> ```javascript
> const m = new Map([
>   ["key1", "val1"],
>   ["key2", "val2"],
>   ["key3", "val3"],
> ]);
> const arr = [
>   ["key1", "val1"],
>   ["key2", "val2"],
>   ["key3", "val3"],
> ];
> 
> m.forEach((key, value) => console.log(key, " -> ", value));
> arr.forEach((item, index) => console.log(item, " -> ", index));
> 
> ```
>
> ![image-20211206154217545](https://img2020.cnblogs.com/blog/1735896/202112/1735896-20211206222053575-2067740888.png)
>
> 不难发现： 映射的实例方法`forEach()` 的callback 函数的参数直接就是映射的键值对。 
> 数组的`forEach()` 方法的callback函数的参数则是数组项，然后是对应索引值。 



### 1.3 Object 和 Map 怎么做选择 ？

![image-20211206165446293](https://img2020.cnblogs.com/blog/1735896/202112/1735896-20211206222053171-1854010133.png)



## 2. WeakMap

WeakMap（弱映射）是一种新的集合类型。 是Map 的兄弟类型， 其API 也是 Map 的子集。 WeakMap 中的 "weak" 描述的是 JavaScript 垃圾回收机程序对待 “弱映射” 中键的方式。 

（略）





## 3. Set

### 3.1 基本API 

Set 在很多方面都像是加强的 Map, 这是因为它们的大多数API和行为都是共有的。译作 ”集合“

#### 3.1.1 Set 实例的创建

使用 `new` 关键字和 `Set()` 构造函数以创建一个空集合：

```javascript
const m = new Set();
```

如果想在创建的同时初始化实例，则可以**给Set 构造函数传入一个可迭代对象**， 其中需要包含插入到新集合实例中的元素：

```javascript
// 使用 数组 初始化集合
const s1 = new Set(["val1","val2","val3"]);
alert(s1.size);// 3

// 使用自定义迭代器初始化集合
const s2 = new Set({
    [Symbol.iterator]: function*(){
        yield "val1";
        yield "val2";
        yield "val3";
    }
});
alert(s2.size); //3
```

#### 3.1.2 Set 的实例属性

- `size` ： 元素数量

#### 3.1.3 Set 的实例方法

- `add()` ： 增加值
- `has()`: 查询
- `delete()`: 删除
- `clear()` : 清空

```javascript
const s = new Set();

alert(s.has("Matt"));// false
alert(s.size);//0

s.add("Matt").add("Frisbie");

alert(s.has("Matt")); // true
alert(s.has("Frisbie")); // true
alert(s.size);// 1

s.clear(); // 销毁集合实例中的所有值

alert(s.has("Matt"));// false
alert(s.has("Frisbie"));// false
alert(s.size);//0
```

**:warning:注意：**

1. 和 Map 类似， Set 可以包含任何JavaScript 数组类型作为值。 集合也使用相当于**严格对象相等的标准来检查值的匹配性**。

   ```javascript
   const s = new Set();
   
   const functionVal = function(){};
   const symbolVal = Symbol()l
   const objectVal = new Object()
   
   s.add(functionVal).add(symbolVal).add(objectVal);
   
   alert(a.has(functionVal));	// true
   alert(s.has(symbolVal));	// true
   alert(s.has(objectVal));	// true
   
   alert(s.has(function() {})); // false
   ```

2. 与严格相等一样，用作值的对象和其他”集合“类型在自己的内容或者属性被修改时也不会改变

   ```javascript
   const s = new Set();
   const objVal  = {},
         arrVal = [];
   
   s.add(objVal);
   s.add(arrVal);
   
   objVal.bar = "bar";
   arrVal.push("bar");
   
   alert(s.has(objVal)); // true
   alert(s.has(arrVal)); // true
   ```

3. **`add()` 和 `delete()` 操作是幂等的， `delete()` 返回一个布尔值，表示集合中是否存在要删除的值：**

   ```javascript
   const s = new Set();
   
   s.add('foo');
   alert(s.size);//1
   s.add('foo');
   alert(s.size);//1
   ```

   ```javascript
   // 集合中有这个值
   alert(s.delete('foo')); // true
   
   // 集合中没有这个值
   alert(s.delete('foo')); // false
   ```



#### 3.1.4 顺序和迭代

和 Map 一样， Set 也会维护值插入时的顺序，因此支持按顺序迭代。

##### 3.1.4.1 使用迭代器迭代集合实例 

集合实例可以提供一个迭代器（iterator）, 能以插入顺序生成集合内容。 可以通过**`values()` 方法及其别名`keys()`** 取得这个迭代器 （或者Symbol.iterator 属性，它引用`values()` ）。

```javascript
alert(s.values === s[Symbol.iterator]); // true
alert(s.keys === s[Symbol.iterator]); // true
```

```javascript
const s = new Set(['val1','val2','val3']);
for (let value of s.values()){
    alert(value);
}
// val1
// val2
// val3

for (let value of s[Symbol.iterator]()){
    alert(value);
}
// val1
// val2
// val3
```

**实际上`values()` 是默认的迭代器，所以其实可以直接操作集合实例**

```javascript
const s = new Set(['val1','val2','val3']);
for (let value of s){
	console.log(value) 
}
// val1
// val2
// val3
```

也可以直接对其使用**扩展操作**， 把集合转换为数组：

```javascript
const s = new Set(['val1','val2','val3']);
console.log([...s]) ;//  ['val1', 'val2', 'val3']
```

> **:warning: 注意:**
>
> 1. 对于Set 来讲，由于没有键值对应关系， 其实例方法 `keys()`, `values()`, 及其`values()` 的引用`[Symbol.iterator]` 是两两全等的。 
>
>    ```javascript
>    const s = new Set(["val1", "val2", "val3"]);
>    console.log(s.keys === s.values); //true
>    console.log(s.keys === s[Symbol.iterator]); //true
>    console.log(s.values === s[Symbol.iterator]); //true
>    ```



##### 3.1.4.2 不使用迭代器， 使用回调迭代

和Map 是一样的， Set 也提供了类似普通数组的`forEach(callback, opy_thisArg)` 实例方法。 

但是由于没有键值对应关系，其callback 函数的参数，依次为 元素值、元素值、实例本身

```javascript
const s = new Set(["val1", "val2", "val3"]);
s.forEach((val, dupval, instance) =>
  console.log(val, "->", dupval, "->", instance),
);
//val1 -> val1 -> Set(3) {'val1', 'val2', 'val3'}
//val2 -> val2 -> Set(3) {'val1', 'val2', 'val3'}
//val3 -> val3 -> Set(3) {'val1', 'val2', 'val3'}
```

如果只传入一个参数，将会是 元素值

```javascript
const s = new Set(["val1", "val2", "val3"]);
s.forEach((val) => console.log(val));
// val1
// val2
// val3
```



**:star:注意：**

另外值得注意的是， 也是和Map 一样, 在迭代时， 元素是可以被修改的。 

准确的说，如果元素是引用类型， 只要不改变其对内存地址的引用，就可以任意改动。 

但是如果是原始值， 则不能被修改。

```javascript
// 字符串原始值作为值不会被修改
const s1 = new  Set(["val1"]);
for (let value of s1.values()){
    value = "newVal";
    alert(value); // newVal
    alert(s1.has("val1")); // true
}


// 修改值对象的属性， 但是对象任然存在于集合中
const valObj = {id:1};
const s2 = new Set([valObj]);
for(let value of s2.values()){
    value.id = "newId";
    alert(value); // {id :"newId"}
    alert(as.has(valObj)); // true
}
alert(valObj); // {id:"newId"}
```



#### 3.1.5  定义正式集合操作

> 这里介绍了诸多的 Set的常用扩展方法，用于增强Set操作。 不详细展开，需要时再去看看



## 4. WeakSet

WeakSet 是 Set 的“兄弟”类型，其 API 也是 Set 的子集。 WeakSet 中的“weak”（弱），描述的
是 JavaScript 垃圾回收程序对待“弱集合”中值的方式。 

（略）







## 小结

ES6 新增了一批引用类型：Map、WeakMap、Set、WeakSet。 这些类型为组织应用程序数据和简化内存管理提供了新能力。