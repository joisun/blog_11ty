---
title: 使用 Charles 抓取 Claude Code API 请求
date: '2026-03-09'
tags:
  - Claude Code
  - Charles
  - 调试
  - SSL证书
  - 代理
---

## 一、问题背景

想看看 Claude Code 到底发了什么请求给 API？用 Charles 抓包是最直观的方式。但直接配置代理后会遇到 SSL 证书错误：

```
Unable to connect to API: Self-signed certificate detected.
Check your proxy or corporate SSL certificates
```

本文从零开始配置 Charles，一步步实现对 Claude Code API 请求的抓包。

## 二、配置 Charles

### 2.1 配置代理端口

1. 打开 Charles，点击菜单 **Proxy → Proxy Settings...**
2. 确认 HTTP Proxy 端口（默认 `8888`，可自定义，本文使用 `8998`）
3. **不要勾选** "macOS Proxy"（我们不需要系统级代理，只需要 Claude Code 走代理）

> 为什么不开 macOS Proxy？因为我们只想抓 Claude Code 的请求，不需要让所有流量都经过 Charles。通过环境变量指定代理更精准。

### 2.2 配置 SSL Proxying

Charles 默认不会解密 HTTPS 流量，需要手动开启：

1. 点击菜单 **Proxy → SSL Proxying Settings...**
2. 勾选 **Enable SSL Proxying**
3. 在 Include 列表中点击 **Add**，添加：
   - Host: `api.anthropic.com`
   - Port: `443`

这样 Charles 只会对 Anthropic API 的请求进行 SSL 解密，不影响其他流量。如果你是其他的中转 BaseUrl, 你需要在 Host 填写

### 2.3 导出根证书

Claude Code 基于 Node.js，需要让 Node.js 信任 Charles 的自签名证书：

1. 点击菜单 **Help → SSL Proxying → Save Charles Root Certificate...**
2. 保存为 PEM 格式，建议保存到用户目录：`~/charles-ssl-proxying-certificate.pem`

## 三、启动 Claude Code

使用环境变量指定代理和证书：

```bash
https_proxy=http://127.0.0.1:8998 \
http_proxy=http://127.0.0.1:8998 \
NODE_EXTRA_CA_CERTS=~/charles-ssl-proxying-certificate.pem \
claude
```

**参数说明：**
- `https_proxy` / `http_proxy` — 指向 Charles 代理地址
- `NODE_EXTRA_CA_CERTS` — 让 Node.js 信任 Charles 根证书，解决 `Self-signed certificate detected` 错误

启动后在 Claude Code 中正常对话，Charles 就能看到发往 `api.anthropic.com` 的请求了。

## 四、抓包结果分析

抓到请求后，你可以在 Charles 中查看：

- **请求体** — Claude Code 实际发送的 prompt、system message、tool 定义等完整内容
- **响应体** — API 返回的原始响应，包括 token 使用量
- **Headers** — API 版本、模型参数等元信息
- **时序** — 每次 API 调用的耗时和响应大小

## 五、简化启动

如果经常需要抓包，可以在 `~/.zshrc` 中添加别名：

```bash
alias claude-debug='https_proxy=http://127.0.0.1:8998 http_proxy=http://127.0.0.1:8998 NODE_EXTRA_CA_CERTS=~/charles-ssl-proxying-certificate.pem claude'
```

之后直接运行 `claude-debug` 即可。
