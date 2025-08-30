---
title: React应用的创建
date: 2023-07-11
tags:
  - React
---


## CDN Demo 引用
以下是一个在 cdn 中初试 react 的 demo:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <!-- core react library -->
        <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
        <!-- react-dom 用于浏览器渲染，react 还可以开发原生应用这时候就依赖react-native -->
        <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
        <title>Hello React!</title>
    </head>

    <body>
        <div id="root"></div>
        <script>
            function App() {
                const [time, setTime] = React.useState(
                    new Date().toLocaleTimeString()
                );
                React.useEffect(function () {
                    setInterval(function () {
                        setTime(new Date().toLocaleTimeString());
                    }, 1000);
                }, []);
                return React.createElement(
                    "header",
                    null,
                    `Hello React! ${time}`
                );
            }
            const root = ReactDOM.createRoot(document.getElementById("root"));
            root.render(React.createElement(App));
        </script>
    </body>
</html>
```

React 是一个 JS 库， React 的官方说它严格意义上并不是一个框架， 它只注重 UI 层面。

React 的执行，依赖两个核心：

-   react : React 的核心逻辑库
-   react-dom: React 的渲染逻辑库，它负责将内容渲染到网页中。

React 还可以用于写原生应用，这时候，React 的核心逻辑是一样的， 不过渲染库就不再是 react-dom 了。 而是 react-native


## 脚手架

目前 React 的主流创建方式有两种选择：

-   Create-react-app
    create-react-app 是一个官方的用于创建基于 React 的 SPA 应用 的 CLI 工具
-   Vite

### 利用 Create-react-app 创建 React 应用


利用 create-react-app 最简单地创建一个 react 应用：

```bash
npx create-react-app my-app

```

### --template 参数

--template 参数用于指定模板, 其用法如下：

```bash
npx create-react-app my-app --template [template-name]
```

```bash
# 创建 ts 项目
npx create-react-app my-app --template typescript
```

更多的 template， 可以在 npm 上搜索 ["cra-template-\*"](https://www.npmjs.com/search?q=cra-template-*) 以查看更多

### 使用不同的包管理工具

要使用不用的包管理工具，只需要在执行 create-react-app 的使用，用不同的包管理工具即可，例如：

```bash
# 默认使用npm
npx create-react-app my-app
#使用 yarn
yarn create react-app my-app
```


### 利用 Vite 创建 React 应用


使用 vite 创建 react 应用很简单， 只需要：

```bash
# 使用pnpm 创建
pnpm create vite
# 然后按需选择工具就可以了
```
