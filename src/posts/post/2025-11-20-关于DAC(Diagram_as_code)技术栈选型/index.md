---
title: AI 绘图的最佳实践：DaC, MCP 与 Kroki 的终极组合
date: '2025-11-20'
tags:
  - LLM
  - AI Engineering
  - MCP
  - Kroki
  - D2
---

> 核心观点：在 LLM 时代，绘图不再是拖拽像素，而是**Token 的艺术**。把“思考”留给 AI，把“排版”留给算法，把“渲染”交给 Kroki。

让 GPT-4 或 Claude 直接画图（生成图片）通常是灾难现场：文字乱码、逻辑错乱。因为 LLM 是概率模型，它懂逻辑，但极其不擅长处理像素坐标 (X,Y)。

最优雅的解法是 **Diagram as Code (DaC)**。

LLM 生成代码，工具渲染图片。最近我在开发基于 **MCP (Model Context Protocol)** 的绘图工具链，测试了主流 DaC 方案。本文将从 AI 工程化的角度，聊聊如何搭建一套**省 Token、高颜值、易集成**的 AI 绘图系统。

## 评测维度：AI 视角的“不可能三角”

区别于人类手写，AI 生成代码主要关注三个指标：

1.  **Token 密度 (Token Efficiency)**：
    * 同样的图，代码越短越好。这不仅省钱，更能防止撑爆 Context Window（上下文窗口）。
2.  **算法鲁棒性 (Layout Algorithm)**：
    * AI 生成的节点顺序往往是乱的。工具必须具备强大的自动布局能力，能把一堆乱序节点排列得井井有条。
3.  **模型对齐 (Alignment)**：
    * LLM 对该语言是否“母语级”掌握？冷门语法会导致严重的幻觉。

## 主流选手深度横评

### 1. Mermaid：LLM 的“通用语”
如果你的 AI Agent 需要最大兼容性，Mermaid 是唯一解。

* **AI 适配度**：👑 Top 1。Github 的海量数据让所有模型都精通它。
* **Token 消耗**：中等。
* **缺陷**：布局算法较弱。节点超过 15 个时，生成的流程图容易变成“蜘蛛网”，难以阅读。
* **适用场景**：轻量级对话、简单的时序图/流程图。

### 2. D2 (Declarative Diagramming)：Token 吝啬鬼
这是我最推荐给 AI 使用的“黑马”语言。

* **Token 效率**：**极高**。
    * Mermaid: `A --> B: Text`
    * D2: `A -> B: Text` (支持嵌套结构，大幅减少重复声明)
* **布局天花板**：D2 的 TALA 引擎是目前自动布局的最强王者。即便 AI 生成的逻辑很乱，D2 也能渲染出非常现代、美观的拓扑图。
* **适用场景**：复杂系统架构图、ER 图、追求高颜值的输出。

### 3. PlantUML：逻辑重坦
* **地位**：严谨场景（如复杂 UML 类图）的守门员。
* **缺点**：语法啰嗦，Token 消耗大（大量的 `start/end`, `participant` 样板代码）。
* **建议**：除非必须遵循严格 UML 标准，否则在 AI 场景下不推荐。

### 4. 反面教材：为什么不选 JSON/XML？
* **Excalidraw/Draw.io**：千万别让 AI 生成这些格式。
    * **Token 爆炸**：描述一个矩形需要几十行 JSON 坐标属性。
    * **坐标地狱**：AI 算不准绝对坐标，会导致严重的元素重叠。

---

## 渲染架构：Kroki 才是 AI 的最佳伴侣

选好了语言（Mermaid/D2），怎么渲染？

在 AI Agent 或 MCP Server 中安装 Java (PlantUML)、Node.js (Mermaid) 或 Go 二进制 (D2) 是非常愚蠢的架构设计——环境依赖太重，Docker 镜像会巨大无比。

**[Kroki](https://kroki.io)** 是完美的解决方案。

它是一个**统一的渲染网关**，提供简单的 HTTP API。你只需要把代码丢给它，它返回图片。

### 为什么 Kroki 适合 AI？
1.  **Unified Interface**：Agent 只需要知道一个 URL 格式，就能支持 20+ 种绘图语言。
2.  **Stateless**：无状态，极其适合 Serverless 或 MCP 部署。
3.  **私有化**：一行 Docker 命令即可私有部署，数据不出内网。

```bash
# 极简部署 Kroki
docker run -d --name kroki -p 8000:8000 yuzutech/kroki