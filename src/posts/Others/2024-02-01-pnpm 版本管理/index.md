---
title: pnpm 版本管理
date: 2024-02-01
tags:
  - post
---

启用 corepack 管理

```bash
corepack enable
```

设定当前pnpm 版本

```bash
corepack prepare pnpm@7.13.6 --activate
corepack prepare pnpm@latest --activate
corepack prepare pnpm@latest-6 --activate
```
