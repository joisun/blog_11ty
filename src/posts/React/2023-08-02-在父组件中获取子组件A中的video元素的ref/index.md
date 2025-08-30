---
title: 在父组件中获取子组件 A 中的 video 元素的 ref
date: 2023-08-02
tags:
  - React
---



记一次开发问题：

我有一组件A ，如下

```tsx
// ......
  return (
    <div className="relative w-full max-w-[1000px] mx-auto">
      <video
// ......
```

现在我在 父组件中， 需要获取到这个 A 组件中的 video 元素的 ref， 我可以怎么做呢？



----

要在父组件中获取子组件 A 中的 video 元素的 ref，你可以使用 React 的 `forwardRef` 和 `useImperativeHandle` 钩子。这里是一个步骤详解:

1. 在子组件 A 中使用 `forwardRef` 并通过 `useImperativeHandle` 暴露 video 元素的 ref:

```jsx
import React, { forwardRef, useRef, useImperativeHandle } from 'react';

const ComponentA = forwardRef((props, ref) => {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    videoElement: videoRef.current
  }));

  return (
    <div className="relative w-full max-w-[1000px] mx-auto">
      <video ref={videoRef} {...props} />
    </div>
  );
});

export default ComponentA;
```

2. 在父组件中，创建一个 ref 并将其传递给子组件 A:

```jsx
import React, { useRef, useEffect } from 'react';
import ComponentA from './ComponentA';

const ParentComponent = () => {
  const componentARef = useRef(null);

  useEffect(() => {
    if (componentARef.current) {
      const videoElement = componentARef.current.videoElement;
      // 现在你可以使用 videoElement 了
      console.log(videoElement);
    }
  }, []);

  return (
    <div>
      <ComponentA ref={componentARef} />
    </div>
  );
};

export default ParentComponent;
```

通过这种方式，你可以在父组件中访问子组件 A 中的 video 元素。

要解释一下这个方法：

1. `forwardRef` 允许子组件接收父组件传递的 ref。
2. `useImperativeHandle` 允许你自定义暴露给父组件的实例值。在这个例子中，我们暴露了 video 元素的 ref。
3. 在父组件中，我们创建了一个 ref（`componentARef`），并将其传递给 ComponentA。
4. 然后，我们可以通过 `componentARef.current.videoElement` 来访问 video 元素。

这种方法保持了良好的组件封装，同时允许父组件在需要时访问子组件的特定 DOM 元素。
