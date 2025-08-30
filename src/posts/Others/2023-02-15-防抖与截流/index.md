---
title: 防抖与截流
date: 2023-02-15
tags:
  - post
---

## 防抖与截流

### 什么是防抖， 什么是截流？

所谓防抖，就是防止事件频繁发生。 例如，用户点击某个按钮，我们希望某个暴躁用户在疯狂点击的时候，我们的事件处理仅执行一次。 又例如，页面大小变化的时候，我们自适应的去重新绘制canvas画布，页面大小变化是一个连续高频触发的事件， 但是由于重新绘制需要消耗一定的计算机算力性能， 所以我们希望在页面大小变化完成后再去执行重绘事件以优化性能。 

所谓截流，可以理解为游戏中的技能cd,  毕竟盖伦和安琪拉的大招不能一直无缝衔接释放，EZ 的 Q技能 也不能让他无缝光速连发，游戏体验太差了。  回归到网页场景中， 有时候在页面大小变化的时候，我们觉得适当的间隔触发画布重绘可能也是好的，可以让用户及时看到页面更新效果。 又或者假如我们确实需要用户不断的点击，参加我们的抢优惠券，或者抢票活动， 那么合理时间内的连续触发，其实是允许且必要的。 这既是所谓的截流。 



### 防抖

关于防抖， 实际上，通常存在两种场景。 一种，例如像屏幕卷动 scroll 事件，我们可能希望在页面卷动过程中不要执行， 待到页面卷动停止以后，再执行某些操作， 而不是从卷动开始就立即执行一次，而后的卷动事件全部忽略。 另一种， 像用户点击事件，我们可能就希望用户点击的时候，立刻触发执行， 而后的连续点击则忽略掉。 

这两种场景，前者叫做 前置防抖 (**Leading Debounce** 或 **Leading Edge Debounce**), 后者叫做 后置防抖（**Trailing Debounce** 或 **Trailing Edge Debounce**）。

> 前置防抖和后置防抖是防抖函数的两种变体，它们在处理函数执行的时机上有所不同
>
> 1. **前置防抖**： 在前置防抖中，函数的执行会在第一次触发时立即执行，而后续的触发则会被忽略，直到经过一定的时间间隔后再次触发才会执行。换句话说，前置防抖是以第一次触发为准的防抖机制，后续触发不会影响首次触发执行的函数。
> 2. **后置防抖**： 在后置防抖中，函数的执行会在一段时间内连续触发时被忽略，直到一段时间内没有触发事件后才执行函数。与前置防抖相反，后置防抖是以最后一次触发为准的防抖机制，之前的触发会被忽略，只有在一定时间内没有新的触发事件时才执行函数

具体的函数实现也有很多， 以下是常见的简单实现：



#### 前置防抖

```ts
/**
 * 前置防抖函数，以第一次触发为准，后续触发被忽略，直到经过一定时间后再次触发才执行函数。
 * @param func - 需要防抖处理的函数
 * @param delay - 防抖延迟时间
 */
export const leadingDebounce = (func: () => void, delay: number) => {
    let timer: NodeJS.Timeout | null = null;
    return () => {
        if (timer) clearTimeout(timer);
        else func(); // 第一次触发立即执行函数
        timer = setTimeout(() => {
            timer = null;
        }, delay);
    };
};
```



#### 后置防抖

```ts
/**
 * 后置防抖函数，连续触发一定时间内的事件只执行最后一次触发的函数，其余触发被忽略。
 * @param func - 需要防抖处理的函数
 * @param delay - 防抖延迟时间
 */
export const trailingDebounce = (func: () => void, delay: number) => {
   //  let timer: NodeJS.Timeout | null = null;
    let timer;
    return ()=>{
        if(timer) clearTimeout(timer)
        timer = setTimeout(func, delay)
    }
};
```



### 截流

```ts
export const throttle = (func: Function, duration: number)=>{
    let switcher = true;
    let timer;
    return ()=>{
        if(switcher){
            // 先执行一次 => 立马关闭执行开关 => 一段时间开启执行开关
            // 如果执行开关时关闭状态， 这个分支完全走不过来

            // 这么做带来的效果就是， 第一次点击会直接触发 走进分支，然后固定一段时间后，延迟开关得以开启， 从而下一次合法时刻，函数会再次触发
            func();
            switcher = false;
            
            clearTimeout(timer)
            timer = setTimeout(()=>{switcher = true}, duration)
        }
    }
}
```

