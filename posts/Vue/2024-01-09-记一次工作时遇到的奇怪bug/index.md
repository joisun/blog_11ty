---
title: 记一次工作时遇到的奇怪bug
date: 2024-01-09
tags:
  - post
---


在我Vue3项目的开发中，我碰到了一个问题。项目中有两个卡片，我通过v-if来控制它们的显示和隐藏。然而，我发现一个奇怪的bug：当我点击上一步按钮时，上一步按钮的位置与另一个卡片中的某个按钮位置重叠，导致点击上一步按钮时，不可见卡片中的按钮点击事件也会被触发。尽管我使用v-if来控制元素的显隐，但上一步卡片中的按钮为何还会被触发呢？

![20240109-103131-ezgif.com-gif-to-mp4-converter](./assets/20240109-103131-ezgif.com-gif-to-mp4-converter.gif)

上一步中卡片的渲染逻辑：

```vue
......
<div class="coll-list" v-if="collSwith.step1 === '3'">
    <div class="coll-line"></div>
    <div class="coll-wrap">
        <div class="fl fl-jc-fs fl-ai-b fl-wrap">
            <div v-for="itm in boxMap" :key="itm.box">
                <div class="prompt-box-option fl-center" :class="isSelected(prompt.box,itm.en)" :key="itm.box"
                    @click.stop="
                            () => {
                                if (
                                    prompt.box &&
                                    prompt.box === itm.en
                                ) {
                                    prompt.box = '';
                                } else {
                                    prompt.box = itm.en;
                                }
                            }
                        ">
                    <div class="flv fl-ai-c fl-jc-fs">
                        <div :style="{
                            backgroundImage: `url(${itm.box})`,
                        }" class="prompt-box-shape"></div>
                        <span class="prompt-box-name">{{
                            itm.name
                            }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
......
```

上一步按钮：
```vue
<div v-if="step === 2" class="prompt-footer fl fl-jc-fe fl-ai-c">
    <a-button
        shape="round"
        :style="{ marginRight: '16px' }"
        @click.stop.prevent="
            () => {
                step--;
            }
        "
    >
        上一步
    </a-button>
    ......
```

