---
title: 记录useEffect闭包陷阱问题
date: 2023-08-02
tags:
  - React
---



记一次开发问题：

我有一组件A ，如下

```tsx
// ...... STATE
  const [startTime, setStartTime] = useState(0);// 时间 tag
  const [endTime, setEndTime] = useState(0);
// ...... useEffect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
// ......
    const handleTimeupdate = ()=>{
      console.log('videoRef.current.currentTime',videoRef.current.currentTime, "startTime: ", startTime, "endTime:", endTime)
      if(videoRef.current && videoRef.current.currentTime > endTime){
        // playAtFromRangeStart()
      }
    }
    video.addEventListener("timeupdate", handleTimeupdate)
  }, []);
// ......


// ...... Change state somewhere.
  const handleChange = (/*.....*/,percentage: number) => {
// ......
  const newTime = /* ...... */
    /* ...... */ setStartTime(newTime) : setEndTime(newTime);
// ......
  };
```

我预期是，视频在播放的时候，会频繁的触发 timeupdate 时间， 然后用户操作的时候会频繁触发 handleChange 事件以更新 `startTime` 和 `endTime`, 我期望 可以在 timeupdate 的handler 中，获取到最新的值。 发现始终都是 0


这种情况， 是由 React 的闭包特性和状态更新的异步性质导致的。

1. 闭包问题：
   当你创建 `handleTimeupdate` 函数时，它捕获了当时的 `startTime` 和 `endTime` 值。即使你后来通过 `setStartTime` 和 `setEndTime` 更新了这些状态，`handleTimeupdate` 函数仍然引用的是旧的值。

2. 异步状态更新：
   React 的状态更新是异步的。当你调用 `setStartTime` 和 `setEndTime` 时，状态并不会立即更新。

解决这个问题有几种方法：

1. 使用 `useRef` 来存储这些值：

```javascript
const startTimeRef = useRef(0);
const endTimeRef = useRef(0);

// 更新时
const updateTimes = (start, end) => {
  startTimeRef.current = start;
  endTimeRef.current = end;
  setStartTime(start);
  setEndTime(end);
};

// 在 handleTimeupdate 中
const handleTimeupdate = () => {
  console.log('videoRef.current.currentTime', videoRef.current.currentTime, 
              "startTime: ", startTimeRef.current, 
              "endTime:", endTimeRef.current);
  // ...
};
```

2. 使用函数式更新和 `useCallback`：

```javascript
const handleTimeupdate = useCallback(() => {
  console.log('videoRef.current.currentTime', videoRef.current.currentTime, 
              "startTime: ", startTime, 
              "endTime:", endTime);
  // ...
}, [startTime, endTime]);

useEffect(() => {
  // ... 其他代码 ...
  video.addEventListener("timeupdate", handleTimeupdate);
  return () => {
    video.removeEventListener("timeupdate", handleTimeupdate);
  };
}, [handleTimeupdate]);
```

3. 直接在事件处理函数中访问最新的状态：

```javascript
const handleTimeupdate = () => {
  console.log('videoRef.current.currentTime', videoRef.current.currentTime, 
              "startTime: ", startTimeRef.current, 
              "endTime:", endTimeRef.current);
  // 使用 getter 函数获取最新状态
  const currentStartTime = getStartTime();
  const currentEndTime = getEndTime();
  // ...
};
```

4. 使用 `useEffect` 监听 `startTime` 和 `endTime` 的变化：

```javascript
useEffect(() => {
  const handleTimeupdate = () => {
    console.log('videoRef.current.currentTime', videoRef.current.currentTime, 
                "startTime: ", startTime, 
                "endTime:", endTime);
    // ...
  };

  const video = videoRef.current;
  if (video) {
    video.addEventListener("timeupdate", handleTimeupdate);
    return () => video.removeEventListener("timeupdate", handleTimeupdate);
  }
}, [startTime, endTime]);
```

这些方法中，我个人推荐使用第一种（`useRef`）或第二种（`useCallback`）方法，因为它们既能解决问题，又不会导致过多的重渲染。
