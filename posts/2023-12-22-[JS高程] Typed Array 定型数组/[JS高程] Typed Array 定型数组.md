[toc]

## 0. 前言

​		关于Typed Array， [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays) 上有一段内容值得先参看阅读一下，有一个基本的认识。

### 0.1 什么是定型数组 （typed arrays） ?

​		什么是定型数组？ 用一句话概括即：定型数组，是一种对内存缓冲区中的原生二进制数据有着读写机制(能力)的一种类数组对象。 (后面会介绍，实际是一种ArrayBuffer 视图)

> JavaScript typed arrays are array-like objects that provide a mechanism for reading and writing raw binary data in memory buffers.

​		我们之前常用的普通数组，其长度是能够动态的变动的，且其元素类型不受限制。 JavaScript 凭着强大的引擎所以这些数组操作能够被快速处理。 
​		但是，现代 web 应用能力增强，也不断的增加了各种特性以满足需求。例如音视频， 使用WebSockets访问原始数据等等。 以及WebGL的日益强大，要求JavaScript需要更强的数据处理能力。而现有的普通数据不便于处理大量的二进制数据，中间有大量的性能损耗。 
​		因此, 我们<ud>需要JavaScript 代码能够快速且简单的操作原始二进制数据</ud>， 这就是 定型数组（typed arrays）诞生的契机。
一个定型数组中的每一个元素都是一种原始二进制值， 这些值可以自 8-bit 整型 到 64-bit 浮点数。

> 值得注意的是， 不要将普通数组和定型数组混淆， 尽管我们后面会介绍它的很多方法，普通数组似乎都是支持的。 但是学习时，最好将它完全独立起来。 如果你尝试使用Array 构造函数提供的`Array.isArray()` 静态方法去判断一个定型数组， 将会返回 `false`



## 1. Buffers 和 Views 

​		为了让定型数组最大程度的灵活和高效， JavaScript 定型数组将其实现分成了两个部分： buffers 和 views. 
一个buffer 就是一个代表了一个数据块的对象(chunk of data)，它由`ArrayBuffer` 对象实现；它没有所谓的格式，也**没有提供访问其内容的机制**。 
​		所以你需要**使用 view (通常都译作”图“/"视图") 访问 一个buffer 中的内存**（the memory contained in a buffer）。 一个 视图 提供了一个上下文，即数据类型（data type）， 起始点偏移(starting offest), 以及元素的数量。

### 1.1 ArrayBuffer

ArrayBuffer 通常是一种用于表示<u>通用，定长</u>的二进制数据缓存的**数据类型** ，下面这张图表示了常见的ArrayBuffer：

![Typed arrays in an ArrayBuffer]([JS高程] Typed Array 定型数组.assets/typed_arrays.png)

在内存中分配一个16个字节大小的ArrayBuffer, 可以用不同bit长度的元素填充。 

- `Uint8Array`: uint8array 类型数组代表一个8位无符号整数数组。 （U 即 unsigned）
- `Uint16Array`: 16位无符号整数数组；
- `Uint32Array`: 32位无符号整数数组；
- `Float64Array`: 64 位浮点数组；

> 有无符号：区别在于值的表示范围不同，例如`Int8Array`的 取值范围是：-128 ~ 127， 但是`Uint8Array` 的取值范围是 ：`0 ~ 255` , 实际范围大小是一样的， 只是取值不同。
>
> 取值范围的计算：如`UInt16Array` 即元素长度为16个bit位，所能表示的最大值即16个bit 全置1， 二进制计算结果就是 十进制的 65535 即2^16 - 1 ， 最小值即全置0， 十进制换算也是0， 所以无符号16bit所表示的值范围就是0~65535。  而`Int16Array` 是带符号的， 因此最bit位为符号位，表示正负， 剩下15位用于表示数值， 所以最大值即15位全置1， 即 32767, 至于最小值则是高位置负，其余位全1，即 -32727， 但是要 减1， 所以有符号16bit 表示的值范围就是 -32728 ~ 32727。至于为什么这里不做探究，其他的更多位都是同理。
>
> 再如 `Uint32Array` 即32个bit位，由于无符号，其所能表示的二进制最大值即32 个 1， 4,294,967,295,所以表示范围为 0 ~ 4,294,967,295。 更多的值范围可参看这里 [link](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#typed_array_views)。



#### 1.1.1 创建ArrayBuffer实例

```javascript
const buf = new ArrayBuffer(16); // 在内存中分配16字节
```

#### 1.1.2 读取ArrayBuffer的 字节长度

```javascript
alert(buf.byteLength); // 16
```



**:warning:注意：**

- ArrayBuffer 一经创建，就不能再去动态调整大小
- 要读取或者写入ArrayBuffer, 就必须通过视图， 视图有不同的类型，但引用的都是ArrayBuffer中存储的二进制数据。



### 1.2 DataView

​		这是第一种允许你读写ArrayBuffer 的视图类型 —— DataView。
​		该视图专为文件I/O 和 网络 I/O 设计， 其 API 支持对缓冲数据的高度控制，但是相比于其他类型的视图性能也差一些。 DataView 对缓冲内容没有任何预设，也不能迭代。

​		必须在对已有的ArrayBuffer 读取或者写入时才能创建DataView 实例。 这个实例可以使用全部或者部分ArrayBuffer， 且维护着对该缓冲实例的引用，以及视图在缓冲中开始的位置。 

#### 1.2.1 创建DataView 实例

​	DataView 的构造函数接收三个参数， 分别是： 目标ArrayBuffer 实例、 可选的字节偏移(byteOffset)、 可选的字节长度(byteLength)

```javascript
const buf = new ArrayBuffer(16);
const firstHalfDataView = new DataView(buf, 0, 8);
alert(firstHalfDateView.byteLength); // 8
```

> **访问DataView实例属性**
>
> - `byteOffset` : 访问视图的缓冲起点，上例中`firstHalfDataView.byteOffset` 返回 0 ；
> - `byteLength` : 访问视图的字节长度，上例中`firstHaldDataView.byteLength` 返回 8；
> - `buffer` ： <u>访问视图所访问的目标buffer实例</u>， 上例执行`firstHaldDataView.buffer === buf` 将会返回 `true`

如果仅提供一个可选参数，将会被视作字节偏移，即缓冲起点，然后使用全部剩余Arraybuffer

```javascript
const buf = new ArrayBuffer(16);
const secondHalfDataView = new DataView(buf, 8); // 将从第9个字节开始 到 剩余全部字节
alert(secondHalfDataView.byteLength); // 8
```

如果不提供可选参数，将默认使用整个 ArrayBuffer

```javascript
const buf = new ArrayBuffer(16);
const fullDataView = new DataView(buf);
alert(fullDataView.byteLength); //16
```



#### 1.2.2 通过DataView 访问 buffer

要通过DataView 读取缓冲，还需要几个组件：

1. 首先是要读或者写的字节偏移量。 可以看成DataView 中的某种 “地址”
2. DataView 应该使用`ElementType` 来实现 `JavaScript` 的 Number 类型到缓冲内二进制格式的转换。
3. 最后是内存中值的字节序。 默认为大端字节序。

##### 1.2.2.1 ElementType

DataView 对存储在缓冲内的数据类型没有预设。 它暴露的API 强制开发者在读写时指定一个 ElementTypt。 ES6 支持 8 种不同的 ElementType

| type | `Int8` | `Uint8` | `Int16` | `Uint16` | `Int32` | `Uint32` | `Float32` | `Float64` |
| :--: | :----: | :-----: | :-----: | :------: | :-----: | :------: | :-------: | :-------: |
| byte |   1    |    1    |    2    |    2     |    4    |    4     |     4     |     8     |

DateView 为上表中的每种类型都暴露了`get` 和 `set` 方法， 这些方法使用`byteOffset` (字节偏移量)定位要读取或者写入值的位置。 类型都是可以互换使用的。 

```javascript
// 在内存中分配两个字节并声明一个DataView
const buf = new ArrayBuffer(2);
const view = new DataView(buf);

// 说明整个缓冲确实所有二进制位都是0
// 检查第一个和第二个字符
alert(view.getInt8(0));// 0
alert(view.getInt8(1));// 0
// 检查整个缓冲
alert(view.getInt16(0)); // 0

// 将整个缓冲都设置为1
// 255 的二进制表示是 0xFF
view.setUint8(1,0xFF);

//现在，缓冲里都是1了
// 如果把它当成二补数的有符号整数，则应该是 -1
alert(view.getInt16(0)); // -1
```

##### 1.2.2.2 字节序

`0x1234567`的大端字节序和小端字节序的写法如下图。

![img]([JS高程] Typed Array 定型数组.assets/bg2016112201.gif)

> `01` 是高位（最高有效位）， `67` 是低位。

> 关于字节序，可以看 阮一峰的文章 [《理解字节序》](https://www.ruanyifeng.com/blog/2016/11/byte-order.html)
>
> 计算机电路先处理低位字节，效率比较高，因为计算都是从低位开始的。所以，计算机的内部处理都是小端字节序。
>
> 但是，人类还是习惯读写大端字节序。所以，除了计算机的内部处理，其他的场合几乎都是大端字节序，比如网络传输和文件储存。



DataView 的所有API 方法都以大端字节序作为默认值，但接收一个可选的布尔值参数，设置为`true` 即可启用小端字节序。 （略）

> 基本上用不着，等用的着的时候再看下，不用深究。

##### 1.2.2.3 边界情形

DataView 完成读写操作的前提必须有充足的缓冲区， 否则就会抛出 RangeError :

```javascript
const buf = new ArrayBuffer(6);
consr view = new DataView(buf);

// 尝试读取部分超出缓冲范围的值
view.getInt32(4);
// 尝试读取超出缓冲范围的值
view.getInt32(8);
// 尝试写入超出缓冲范围的值
view.setInt32(4,123);
```





### 1.3 定型数组

**定型数组是另一种形式的ArrayBuffer视图。** 概念上于DataView 接近，但是定型数组的区别在于，它特定于一种ElementType且遵循系统原生的字节序。 相应地，定型数组提供了适用面更广的API 和 更高的性能。 

​		设计定型数组的目的，就是提高与 WebGL 等原生库交换二进制数据的效率。 由于定型数组的二进制表示对操作系统而言是一种容易使用的格式，JavaScript 引擎可以重度优化算术运算、按位运算和其他对定型数组的常见操作，因此使用它们速度极快。 

​		创建定型数组的方式包括读取已有的缓冲、使用自由缓冲、填充可迭代结构，以及填充基于任意类型的定型数组。 另外，通过`<ElementType>.from()` 和 `<ElementType.of()`也可以创建定型数组：

#### 1.3.1 定型数组创建

**创建一个 12 字节的缓冲**

```javascript
const buf = new ArrayBuffer(12);
// 创建一个引用该缓冲的 Int32Array
const ints = new Int32Array(buf);

// 这个定型数组知道自己的每个元素需要4个字节 // 32bit / 8bit = 4byte
// 因此长度为 3 // new Int32Array()指的是每个元素位为32bit,也就是4 字节， 一个12字节的缓冲也就占了3个元素位，即长度为3
alert(ints.length); // 3
```

**创建一个长度为6的Int32Array**

```javascript
const ints2 = new Int32Array(6);
// 每个数值使用4字节， 因此ArrayBuffer 是24字节 , Intl
alert(ints2.length); // 6

// 类似 DataView, 定型数组也有一个指向关键缓冲的引用
alert(ints2.buffer.byteLength); //24
```

**创建一个包含`[2,3,6,8]`的Int32Array**

```javascript
const ints3 = new Int32Array([2,3,6,8]);
alert(ints.length);		//4
alert(ints3.buffer.byteLength);	//16  //每个元素位32bit,4个元素 就是16字节
alert(ints3[2]);	//6
```

**通过复制ints3的值创建一个Int16Array**

```javascript
const ints4 = new Int16Array(ints3);

// 这个新类型数组会分配自己的缓冲
// 对应索引的每个值会相应地转换为新格式
alert(ints4.length);	//4
alert(ints4.buffer.byteLength);	//8 每一个元素位是16bit,即2字节(byte)， 四个元素即8字节
alert(ints5[2]);	//6
```

**基于普通数组类创建一个Int16Array**

```javascript
const ints5 = Int16Array.from([3, 5, 7, 9]);
alert(ints5.length);	// 4
alert(ints5.buffer.byteLength); //8
alert(ints5[2]);	//7
```

**基于传入的参数创建一个Float32Array**

```javascript
const floats = Float32Array.of(3.14, 2.718, 1.618);
alert(floats.length);		//3
alert(floats.buffer.byteLength); //12
alert(floats[2]);	//1.6180000305175781
```



#### 1.3.2  `BYTES_PER_ELEMENT`属性

定型数组的构造函数和实例都有一个 `BYTES_PER_ELEMENT`属性， 返回该类型数组中的每个元素大小：

```javascript
alert(Int16Array.BYTES_PER_ELEMENT);//2
alert(Int32Array.BYTES_PER_ELEMENT);//4
```

```javascript
const ints = new Int32Array(1);
const float = new Float64Array(2);
alert(ints.BYTES_PER_ELEMENT);//4
alert(floats.BYTES_PER_ELEMENT);//8
```

如果定型数组没有用任何值初始化，则其关联的缓冲会以0填充：

```javascript
const ints = new Int32Array(4);
alert(init[0]); //0
alert(init[1]); //0
alert(init[2]); //0
alert(init[3]); //0
```



#### 1.3.3 定型数组行为

从很多方面看，定型数组与普通数组都很相似。 定型数组支持如下操作符、方法和属性：

- `[]`
- `copyWithin()`
- `entries()`
- `every()`
- `fill()`
- `filter()`
- `find()`
- `findIndex()`
- `forEach()`
- `indexOf()`
- `join()`
- `keys()`
- `lastIndexOf()`
- `length`
- `map()`
- `reduce()`
- `reduceRight()`
- `reverse()`
- `slice()`
- `some()`
- `sort()`
- `toLocalString()`
- `toString()`
- `values()`

:warning: 其中，返回新数组的方法也会返回包含同样元素类型（element type）的新定型数组:

```javascript
const ints = new Int16Array([1,2,3]);
consr doubleints = ints.map(x=> 2*x);
alert(doubleints instanceof Int16Array); // true
```



#### 1.3.4 定型数组的迭代

定型数组有一个`Symbol.iterator` 符号属性，因此可以通过 `for...of` 循环和扩展操作符来操作：

```javascript
const ints = new Int16Array([1,2,3]);
for (const int of ints){
    alert(int);
}
// 1
// 2
// 3
alert(Math.max(...ints)) ; //3
```



#### 1.3.5 普通数组 合并|复制|修改 方法 不适用于定型数组

<span style="color:red">定型数组同样使用数组缓冲来存储数据， 而数据缓冲无法调整大小。 因此，下列方法不适用于定型数组：</span>

- `concat()`
- `pop()`
- `push()`
- `shift()`
- `splice()`
- `unshift()`

不过定型数组也提供了两个新的方法， 可以快速的向内或者向外复制数据： 



#### 1.3.6 定型数组方法

##### 1.3.6.1  定型数组的复制方法 `set()` 和 `subarray()`

- `set()`
- `subarray()`

`set()` 从提供的数组或者定型数组中把值复制到当前定型数组中指定的索引位置：

```javascript
// 创建长度为 8的int16 数组
const container = new Int16Array(8);
// 把定型数组赋值为前4个值
// 偏移量默认为索引0 
container.set(Int8Array.of(1,2,3,4));
console.log(container);// [1,2,3,4,0,0,0,0]

// 把普通数组赋值为后四个值
// 偏移量4 表示从索引4 开始插入
container.set([5,6,7,8], 4);
console.log(container); // [1,2,3,4,5,6,7,8]

// 溢出会抛出错误
container.set([5,6,7,8], 7);
// RangeError
```

`subarray()` 执行与`set()` 相反的操作， 它会基于从原始定型数组中复制的值返回一个新定型数组。

复制值时的开始索引和结束索引是可选的：

```javascript
const source = Int16Array.of(2,4,6,8);

// 把整个数组赋值为一个同类型的新数组
const fullCopy = source.subarray();
console.log(fullCopy); //[2,4,6,8]

// 从索引2 开始复制数组 (包含索引2位置的值)
const halfCopy = souce.subarray(2);
console.log(halfCopy); // [6,8]

// 从索引1 开始复制到索引 3 (包含开始索引， 不包含结束索引)
const partialCopy = source.subarray(1， 3)；
console.log(partialCopy); // [4,6]
```



##### 1.3.6.2 定型数组拼接能力

定型数组没有原生的拼接能力，但是使用定型数组API提供的很多工具可以手动构建 ：

```javascript
// 第一个参数是应该返回的数组类型
// 其余参数是应该拼接在一起的定型数组

function typedArrayConcat(typedArraysConstructor, ...typedArrays) {
    // 计算所有数组中包含的元素总数
    const numElements = typedArrays.reduce((x,y) => (x.length || x) + y.length);
    
    // 按照提供的类型创建一个数组， 为所有元素留出空间
    const resultArray = new typedArrayConstructor(numElements);
    
    // 依次转移数组
    let currentOffset = 0;
    typedAArrays.map(x => {
        resultArray.set(x, currentOffset);
        currentOffset += x.length;
    });
    
    return resultArray;
}

const concatArray = typedArrayConcat (IntArray,
                                      Int8Array.of(1,2,3),
                                      Int16Array.of(4,5,6),
                                      Float32Array.of(7,8,9));
console.log(concatArray); //[1,2,3,4,5,6,7,8,9]
console.log(concatArray instanceof Int32Array); // true
```





#### 1.3.7 下溢和上溢

定型数组中，值的下溢或者上溢不会影响到其他索引，但是仍然需要考虑数组的元素应该是什么类型。 

定型数组对于可以存储的每个索引只接收一个相关位，而不用考虑它们对实际数值的影响。 以下代码演示了如何处理下溢和上溢：

```javascript
// 长度为2 的有符号整数数组
// 每个索引保存一个二补数形式的有符号整数(范围是 -1 * 2^7 ~ (2^7 - 1)
const ints = new Int8Array(2);

// 长度为2 的无符号整数数组
// 每个索引保存一个无符号整数 (0~255) // (2^7 - 1)
const unsignedInts = new Uint8Array(2);

// 上溢的位不会影响相邻索引
// 索引只取最低有效位上的 8 位
unsignedInts[1] = 256; //0x100
console.log(unsignedInts);//[0, 0]
unsignedInts[1] = 511; // 0x1FF
console.log(unsignedInts);// [0,255]

// 下溢的位会被转换为其无符号的等价值 
// 0xFF 是以二补数形式表示的-1（截取到 8 位）, 
// 但 255 是一个无符号整数 
unsignedInts[1] = -1        // 0xFF (truncated to 8 bits) 
console.log(unsignedInts);  // [0, 255] 
 
// 上溢自动变成二补数形式 
// 0x80 是无符号整数的 128，是二补数形式的-128 
ints[1] = 128;        // 0x80 
console.log(ints);    // [0, -128] 
 
// 下溢自动变成二补数形式 
// 0xFF 是无符号整数的 255，是二补数形式的-1 
ints[1] = 255;        // 0xFF 
console.log(ints);    // [0, -1]
```



除了 8 种元素类型， 还有一种 “夹板” 数组类型 ： Uint8ClampedArray, 不允许任何方向溢出。 超出最大值255的值会被向下舍入为255， 而小于最小值的 0 会被向上舍入为0。 

```javascript
const clampedInts = new Uint8ClampedArray([-1, 0, 255, 256]);
console.log(clampedInts); // [0, 0, 255, 255]
```

