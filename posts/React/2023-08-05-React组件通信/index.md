---
title: React组件通信
date: 2023-08-05
tags:
  - React
---



### 父 -> 子

通过 props， 传递 state

### 子 -> 父

也是通过 props，只不过是父组件传递函数到子组件，子组件调用这个函数，并传入参数。
父组件在这个函数被调用的时候，通过接收参数实现。

### 兄弟组件通信

兄弟组件通信是通过最近的公共父组件作为桥梁实现的。
也就是在公共组件父组件中

-   传递给 A 组件一个函数，
-   传递给 B 组件一个 state.

然后从 A 组件传递数据到 B 组件。
步骤就是先 子(A)传父(公共组件), 然后(公共组件)父传子(B)

### 跨层级通信

#### React.createContext

使用 React.createContext() 创建上下文对象
并在组件中使用 Provider 提供数据，
子组件通过 Consumer 或 useContext 获取数据。

#### 发布订阅模式

使用 mitt.js 发布订阅库示例：

有以下文件目录：

```bash
.
├── App.jsx
├── Mitt.js
└── components
    ├── A.jsx
    └── B.jsx
```

文件内容如下：

```jsx
// App.jsx
import A from "./components/A";
import B from "./components/B";
export default function App() {
    return (
        <div className="comps">
            <A />
            <B />
        </div>
    );
}

// A.jsx
import Mitt from "../Mitt";
import { useState } from "react";

export default function A() {
    const [input, setInput] = useState();
    const handleInputChange = (e) => {
        setInput(e.target.value);
        Mitt.emit("hello", e.target.value);
    };
    return (
        <div className="comp-a">
            <input type="text" value={input} onChange={handleInputChange} />
        </div>
    );
}
// B.jsx
import { useState } from "react";
import Mitt from "../Mitt";
export default function B() {
    const [state, setState] = useState("-");
    Mitt.on("hello", (val) => {
        setState(val);
    });
    return (
        <div className="comp-b">
            <p>component b: {state}</p>
        </div>
    );
}

```

### 全局通信
和 Vue 一样，也是通过全局状态管理库来实现的。 
比较流行使用的有Redux, Mbox, Zustand