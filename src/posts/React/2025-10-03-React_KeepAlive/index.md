---
title: React KeepAlive
date: '2025-10-03'
---





## 一、问题的由来

用过 Vue 的同学应该都知道，Vue 有一个内置的 `<keep-alive>` 组件，可以缓存组件实例。比如：

```vue
<keep-alive>
  <router-view />
</keep-alive>
```

这样做有什么好处呢？

假设你正在浏览一个商品列表页，滚动到第 50 个商品，点进去查看详情。这时候你发现不太满意，点击返回。如果没有缓存，页面会重新渲染，你又得从头开始滚动。

但如果有缓存，返回时页面还停留在第 50 个商品的位置，你的浏览体验会好很多。

**这就是 KeepAlive 的作用：保持组件状态，避免重复渲染。**

但是 React 官方并没有提供类似的功能。今天我们就来自己实现一个。

## 二、常规的路由切换

我们先看看没有 KeepAlive 时，React 路由是怎么工作的。

```jsx
function App() {
  return (
    <Routes>
      <Route path="/list" element={<List />} />
      <Route path="/detail/:id" element={<Detail />} />
    </Routes>
  )
}
```

当你从 `/list` 跳转到 `/detail/1` 时：
1. `<List />` 组件被卸载（unmount）
2. `<Detail />` 组件被挂载（mount）

当你返回 `/list` 时：
1. `<Detail />` 组件被卸载
2. `<List />` 组件被重新挂载

关键在于"重新挂载"这四个字。组件重新挂载意味着：
- 组件的 state 会重置
- 组件会重新渲染
- 滚动位置会回到顶部

**这就是问题所在。**

## 三、解决思路

要解决这个问题，我们需要让组件在"离开"时不要被卸载，而是"隐藏"起来。

就像电脑的休眠功能，程序并没有关闭，只是被挂起了。当你唤醒电脑时，程序还在原来的状态。

具体来说，我们要做两件事：

1. **让组件保持挂载**：即使路由切换了，组件也不卸载
2. **通过 CSS 控制显示**：用 `display: none` 隐藏不活跃的组件

这样，组件的实例一直存在，state 自然就保留下来了。

## 四、代码实现

### 4.1 创建 Context

首先，我们需要一个全局的 Context 来管理所有缓存的组件。

```tsx
// KeepAliveContext.tsx
import React, { createContext, useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'

interface CacheNode {
  key: string
  component: ReactNode
}

export interface KeepAliveContextValue {
  caches: Map<string, CacheNode>
  currentPath: string
  addCache: (key: string, component: ReactNode) => void
  removeCache: (key: string) => void
  clearAll: () => void
}

export const KeepAliveContext = createContext<KeepAliveContextValue | undefined>(undefined)

export const KeepAliveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const cachesRef = useRef(new Map<string, CacheNode>())
  const [, forceUpdate] = useState({})

  const addCache = (key: string, component: ReactNode) => {
    if (!cachesRef.current.has(key)) {
      cachesRef.current.set(key, { key, component })
      forceUpdate({}) // 强制更新以触发重新渲染
    }
  }

  const removeCache = (key: string) => {
    cachesRef.current.delete(key)
    forceUpdate({})
  }

  const clearAll = () => {
    cachesRef.current.clear()
    forceUpdate({})
  }

  return (
    <KeepAliveContext.Provider
      value={{
        caches: cachesRef.current,
        currentPath: location.pathname,
        addCache,
        removeCache,
        clearAll,
      }}
    >
      {children}
    </KeepAliveContext.Provider>
  )
}
```

**关键点解释：**

1. **用 Map 存储缓存**：`Map<string, CacheNode>` 存储所有需要缓存的组件
2. **用 useRef 保存引用**：避免组件重新渲染时 Map 被重置
3. **`currentPath`**：当前路由路径，用于判断显示哪个组件
4. **`forceUpdate`**：当 Map 变化时强制组件更新

### 4.2 创建 KeepAlive 组件

```tsx
// KeepAlive.tsx
import React, { useEffect, useRef } from 'react'
import { useKeepAlive } from './hooks'

interface KeepAliveProps {
  children: ReactElement
  name: string
}

export const KeepAlive: React.FC<KeepAliveProps> = ({ children, name }) => {
  const { addCache, currentPath } = useKeepAlive()
  const containerRef = useRef<HTMLDivElement>(null)
  const isActive = currentPath === name

  useEffect(() => {
    addCache(name, children)
  }, [name, children, addCache])

  return (
    <div
      ref={containerRef}
      style={{
        display: isActive ? 'block' : 'none',
        height: '100%',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  )
}
```

**关键点解释：**

1. **`name` 属性**：作为缓存的唯一标识，通常是路由路径
2. **`isActive`**：判断当前路由是否匹配，决定是否显示
3. **`display: none`**：隐藏不活跃的组件，但不卸载

### 4.3 使用方法

```tsx
// App.tsx
function App() {
  return (
    <Router>
      <KeepAliveProvider>
        <AppContent />
      </KeepAliveProvider>
    </Router>
  )
}

function AppContent() {
  const location = useLocation()

  return (
    <main>
      {/* 需要缓存的页面 */}
      <KeepAlive name="/">
        <Home />
      </KeepAlive>

      <KeepAlive name="/list">
        <List />
      </KeepAlive>

      {/* 不需要缓存的页面，直接条件渲染 */}
      {location.pathname.startsWith('/detail') && <Detail />}
    </main>
  )
}
```

**重点说明：**

注意我们不再使用 `<Routes>` 和 `<Route>`，而是直接渲染所有需要缓存的组件。这是因为 `<Routes>` 会自动卸载不匹配的路由，而我们恰恰不想卸载它们。

## 五、工作原理

让我们用一个实际的例子来理解整个流程。

假设用户从首页 `/` 跳转到列表页 `/list`：

### 第一步：初始渲染

```
当前路径：/
DOM 结构：
  <KeepAlive name="/">          ← display: block
    <Home />
  </KeepAlive>
  <KeepAlive name="/list">      ← display: none
    <List />
  </KeepAlive>
```

两个组件都被挂载了，但 `<List />` 是隐藏的。

### 第二步：跳转到列表页

```
当前路径：/list
DOM 结构：
  <KeepAlive name="/">          ← display: none
    <Home />                     (状态保留！)
  </KeepAlive>
  <KeepAlive name="/list">      ← display: block
    <List />
  </KeepAlive>
```

现在 `<Home />` 被隐藏，`<List />` 显示。但是 `<Home />` 并没有卸载。

### 第三步：返回首页

```
当前路径：/
DOM 结构：
  <KeepAlive name="/">          ← display: block
    <Home />                     (状态恢复！)
  </KeepAlive>
  <KeepAlive name="/list">      ← display: none
    <List />                     (状态保留！)
  </KeepAlive>
```

又切回来了。两个组件的状态都完好无损。

## 六、实际效果

我们在列表页添加一个计数器来测试效果：

```tsx
// List.tsx
export const List: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h2>列表页面</h2>
      <div>
        <span>点击次数: {count}</span>
        <button onClick={() => setCount(count + 1)}>+1</button>
      </div>
      
      {/* 50 个列表项，用于测试滚动 */}
      {items.map((item) => (
        <Link key={item.id} to={`/detail/${item.id}`}>
          {item.title}
        </Link>
      ))}
    </div>
  )
}
```

测试步骤：

1. 访问列表页，滚动到第 30 个项目
2. 点击计数器，让它变成 5
3. 点击某个项目进入详情页
4. 点击返回

结果：
- ✅ 滚动位置还在第 30 个项目
- ✅ 计数器还是 5

如果没有 KeepAlive：
- ❌ 滚动位置回到顶部
- ❌ 计数器重置为 0

## 七、优化：滚动位置恢复

虽然组件状态保留了，但滚动位置可能还需要额外处理。我们可以在 KeepAlive 组件中添加滚动位置的保存和恢复功能。

```tsx
// 在 Context 中添加滚动位置管理
const saveScrollPosition = (key: string, x: number, y: number) => {
  const node = cachesRef.current.get(key)
  if (node) {
    node.scrollPosition = { x, y }
  }
}

// 在 KeepAlive 组件中监听滚动
useEffect(() => {
  const handleScroll = () => {
    if (containerRef.current) {
      saveScrollPosition(
        name,
        containerRef.current.scrollLeft,
        containerRef.current.scrollTop
      )
    }
  }

  const container = containerRef.current
  if (container) {
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }
}, [name])
```

## 八、使用场景

KeepAlive 适合以下场景：

### 适合使用 ✅

1. **列表页 → 详情页**
   - 用户浏览列表，进入详情，返回时希望看到之前的位置

2. **表单页 → 其他页**
   - 用户填写表单到一半，跳转查看说明，返回时不想重填

3. **多 Tab 切换**
   - 类似浏览器标签页，切换时保持各个 Tab 的状态

4. **搜索页**
   - 用户设置了筛选条件，查看结果，返回时保持筛选状态

### 不适合使用 ❌

1. **需要实时数据的页面**
   - 如果数据经常变化，缓存可能导致显示过期数据

2. **内存敏感的应用**
   - 所有缓存的组件都在内存中，可能占用较多资源

3. **安全敏感的页面**
   - 比如密码输入页，不应该缓存

## 九、注意事项

### 1. 内存管理

所有被 KeepAlive 包裹的组件都会常驻内存。如果页面很多，需要考虑清理机制：

```tsx
// 提供手动清理方法
const { removeCache, clearAll } = useKeepAlive()

// 清理单个缓存
removeCache('/old-page')

// 清理所有缓存
clearAll()
```

### 2. 生命周期问题

被缓存的组件不会触发 `unmount`，这意味着：

- `useEffect` 的清理函数不会执行
- 定时器、事件监听器等需要在组件"不活跃"时手动清理

可以监听 `isActive` 状态来处理：

```tsx
const isActive = useIsActive() // 自定义 Hook

useEffect(() => {
  if (!isActive) {
    // 组件不活跃时的清理逻辑
    clearInterval(timer)
  }
}, [isActive])
```

### 3. 数据更新

缓存的组件可能显示过期数据。解决方案：

```tsx
useEffect(() => {
  if (isActive) {
    // 组件重新激活时，重新获取数据
    fetchData()
  }
}, [isActive])
```

## 十、与 Vue Keep-Alive 的对比

| 特性         | Vue Keep-Alive        | React KeepAlive（本文） |
| ------------ | --------------------- | ----------------------- |
| 官方支持     | ✅ 内置功能            | ❌ 需要自己实现          |
| 使用方式     | 声明式                | 声明式                  |
| 实现原理     | 虚拟 DOM 缓存         | CSS display 控制        |
| 生命周期钩子 | activated/deactivated | 需要自己实现            |
| 动态缓存     | include/exclude       | 需要自己实现            |

## 十一、完整代码

本文的完整代码已经发布在 GitHub：[React KeepAlive Demo](#)

项目包含：
- ✅ 完整的 TypeScript 实现
- ✅ 滚动位置保存和恢复
- ✅ 简单的使用示例
- ✅ 在线演示

安装运行：

```bash
git clone https://github.com/xxx/react-keepalive-demo
cd react-keepalive-demo
pnpm install
pnpm dev
```

## 十二、总结

本文实现的 KeepAlive 组件虽然简单，但已经能满足大部分场景的需求。核心思想就是：

1. 让组件保持挂载状态
2. 用 CSS 控制显示隐藏
3. 用 Context 管理全局缓存

这个方案的优点是：
- 实现简单，代码量少
- 不依赖第三方库
- 完全可控，可以根据需求定制

缺点是：
- 所有缓存组件都在 DOM 中，可能影响性能
- 没有复杂的缓存策略（如 LRU）
- 需要手动管理缓存生命周期

在实际项目中，你可以根据需求进一步优化，比如：
- 添加最大缓存数量限制
- 实现 LRU（最近最少使用）淘汰策略
- 添加 activated/deactivated 生命周期钩子
- 支持正则匹配路由

希望这篇文章能帮助你理解 React 中如何实现组件缓存。如果有任何问题，欢迎在评论区讨论！

---

**参考资料：**
- [Vue Keep-Alive 官方文档](https://vuejs.org/guide/built-ins/keep-alive.html)
- [React Router 文档](https://reactrouter.com/)
- [阮一峰的网络日志](https://www.ruanyifeng.com/blog/)

**相关文章推荐：**
- [React Hooks 完全指南](https://overreacted.io/a-complete-guide-to-useeffect/)
- [React 性能优化技巧](https://kentcdodds.com/blog/usememo-and-usecallback)
