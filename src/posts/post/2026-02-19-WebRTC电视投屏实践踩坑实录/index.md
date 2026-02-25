---
title: 'WebRTC电视投屏实践踩坑实录: 从 SDP 解析失败到 mDNS 不可达'
date: '2026-02-19'
---

# WebRTC 投屏到电视踩坑实录：

> 一个简单的局域网 WebRTC 屏幕共享应用，在 Mac 和手机上运行完美，到了电视上却花了近 5 小时才跑通。本文记录完整的排查过程和两个关键修复。

## 背景

我做了一个基于 WebRTC 的局域网屏幕共享工具，架构很简单：

- Node.js + Express + Socket.IO 做信令服务器
- 浏览器端用原生 WebRTC API
- Mac 上 Chrome 分享屏幕，局域网内其他设备打开网页观看

Mac 和手机都能正常观看，但电视上死活不行。电视用的是 TVBro 浏览器，内核是 Android WebView。

## 第一个障碍：看不到错误信息

电视浏览器没有 DevTools，看不到 console 输出。第一步是搭建远程调试能力。

我做了两件事：

**1. 屏幕内日志面板**

劫持 `console.log/error/warn`，把所有输出渲染到页面上的一个 debug panel：

```javascript
const origLog = console.log;
console.log = (...args) => {
    addLog(args.join(" "), "info");
    origLog(...args);
};
```

**2. 日志编码系统**

给每条日志加短代码（S01、B05、W99 等），这样在电视上看到错误时，只需要报 "W99: xxx" 就能快速定位：

```
[S01] Socket connected
[B05] Watcher connected: abc123
[W99] Offer handling error: Failed to parse SessionDescription...
```

**3. 服务器端日志文件**

客户端通过 Socket.IO 把日志发送到服务器，写入 `logs/client.log`（JSON 格式，包含时间戳、socketId、UA 等），这样不用盯着电视屏幕也能分析问题。

## 第一个坑：`a=extmap-allow-mixed` SDP 解析失败

### 现象

电视端报错：
```
[W99] Offer handling error: Failed to parse SessionDescription.
      a=extmap-allow-mixed Expects at least 2 fields.
[W99a] Error name: OperationError
```

Mac 和手机完全正常。

### 原因

电视的 WebView 内核版本太旧。从 User-Agent 看到：

```
Chrome/96.0.4664.45   （电视）
Chrome/145.0.0.0      （Mac）
```

`a=extmap-allow-mixed` 是 Chrome 71+ 引入的 SDP 属性。旧版内核在 `setRemoteDescription()` 时遇到不认识的属性格式会直接抛 `OperationError`。

### 尝试过的弯路

- **adapter.js**：Google 官方的 WebRTC 兼容层。但它的最新版本内部调用了 `RTCPeerConnection.getConfiguration()`，这个 API 在 Chrome 69 之前不存在，反而在电视上报了新错误 `this.getConfiguration is not a function`。对于这么老的内核，adapter.js 帮不上忙。

### 最终修复

在 `setRemoteDescription` 之前，手动过滤掉旧内核不认识的 SDP 属性：

```javascript
function cleanSDP(sdp) {
    if (!sdp) return sdp;
    const lines = sdp.split('\r\n');
    const cleaned = [];
    for (const line of lines) {
        if (line === 'a=') continue;
        if (line.startsWith('a=extmap-allow-mixed')) continue;
        cleaned.push(line);
    }
    return cleaned.join('\r\n');
}

// 使用
const cleanedOffer = { type: offer.type, sdp: cleanSDP(offer.sdp) };
await pc.setRemoteDescription(cleanedOffer);
```

修复后，SDP 解析通过了，信令流程完全正常（W07 → W08 → W09 → W10 → W11 全部成功），`ontrack` 也触发了。

但是——还是没有画面。

## 第二个坑：mDNS ICE Candidate 不可达

### 现象

SDP 问题解决后，日志显示信令完全成功，但 ICE 连接状态在 `checking` 15 秒后变成 `failed`：

```
[W03] ICE state: checking
...（15秒后）
[W03] ICE state: failed
```

### 排查

给 ICE candidate 加了详细日志，打印实际的候选地址：

```javascript
pc.onicecandidate = (e) => {
    if (e.candidate) {
        addLog(`[B08] ICE candidate: ${e.candidate.candidate.substring(0, 80)}`);
    }
};
```

日志揭示了真相：

```
// Mac 发出的 host candidate：
candidate:... 920bd423-1562-444b-b660-3be038f1de7c.local 54321 typ host

// 电视发出的 host candidate：
candidate:... 192.168.0.100 43375 typ host
```

Mac 的 host candidate 用的是 **mDNS 地址**（`xxx.local`），不是真实的局域网 IP `192.168.0.119`。

### 原因

Chrome 75+ 引入了 WebRTC IP 隐私保护（[spec](https://tools.ietf.org/html/draft-ietf-rtcweb-ip-handling)），默认用 mDNS 地址替代真实的本地 IP，防止网页通过 WebRTC 泄露用户的局域网 IP。

现代浏览器能通过 mDNS 协议解析 `.local` 地址，所以 Mac 对 Mac、手机对 Mac 都没问题。但电视的旧版 WebView **不支持 mDNS 解析**，收到 `xxx.local` 后无法找到对应的 IP，ICE 连接自然建立不起来。

唯一能用的候选是 STUN 返回的 srflx candidate（公网 IP `117.152.179.230`），但局域网内走公网 IP 需要路由器支持 hairpin NAT，大多数家用路由器不支持。

### 最终修复

在信令服务器转发 ICE candidate 时，检测 `.local` 地址并替换为发送者的真实 LAN IP：

```javascript
socket.on("candidate", (id, candidate) => {
    if (candidate && candidate.candidate && candidate.candidate.includes('.local')) {
        let senderIP = socket.handshake.address;
        if (senderIP === '::1' || senderIP === '127.0.0.1' || senderIP === '::ffff:127.0.0.1') {
            senderIP = getLocalIPv4Address();
        } else {
            senderIP = senderIP.replace('::ffff:', '');
        }
        candidate = {
            ...candidate,
            candidate: candidate.candidate.replace(/[a-f0-9-]+\.local/g, senderIP)
        };
    }
    io.to(id).emit("candidate", socket.id, candidate);
});
```

这个修复利用了一个事实：信令服务器知道每个客户端的真实 IP（从 socket 连接获取），可以在转发时做地址替换。

修复后：
```
[W03] ICE state: checking
[B07] ICE state: connected     ← Mac 端连接成功
[B06] Connection state: connected
[W03] ICE state: connected     ← 电视端连接成功
```

电视终于有画面了。

## 总结

两个问题，两个不同的层面：

| 问题 | 层面 | 原因 | 修复位置 |
|------|------|------|----------|
| `a=extmap-allow-mixed` 解析失败 | SDP 协议兼容 | 旧内核不认识新 SDP 属性 | 客户端（过滤 SDP） |
| mDNS candidate 不可达 | ICE 网络连接 | 旧内核不支持 mDNS 解析 | 服务器端（替换地址） |

几个经验：

1. **远程调试能力是第一优先级**。没有日志，一切都是盲猜。屏幕内 debug panel + 服务器端日志文件的组合在无 DevTools 的设备上非常有效。

2. **日志编码系统值得投入**。给每条日志加短代码（W99、B08），在电视这种输入不便的设备上，报错时只需要说 "W99: xxx" 就够了，大幅降低沟通成本。

3. **adapter.js 不是万能的**。它解决的是 API 层面的差异（比如 `webkitRTCPeerConnection` vs `RTCPeerConnection`），对于 SDP 语法兼容和 mDNS 这类底层问题无能为力。而且它的最新版本本身可能就不兼容太老的内核。

4. **mDNS 是个隐蔽的坑**。在同一局域网内，你会理所当然地认为 ICE 应该直接用局域网 IP 连接。但 Chrome 75+ 的隐私保护把真实 IP 藏在了 mDNS 后面，如果对端不支持 mDNS 解析，连接就会静默失败——没有明确的错误信息，只有 ICE state 从 `checking` 变成 `failed`。

5. **信令服务器是做兼容的好地方**。它是所有消息的中转站，知道每个客户端的真实 IP，可以在转发 SDP 和 ICE candidate 时做必要的修改，而不需要改动客户端代码。

## 最终架构

```
Mac (Chrome 145)                    TV (Chrome 96 WebView)
     |                                      |
     |  1. Share Screen                     |
     |  2. socket.emit("broadcaster")       |
     |                                      |  3. socket.emit("watcher")
     |  4. createOffer()                    |
     |  5. emit("offer", sdp)              |
     |          ↓                           |
     |    [信令服务器]                       |
     |    - 转发 offer                      |
     |          ↓                           |
     |                          6. cleanSDP(sdp)  ← 过滤 extmap-allow-mixed
     |                          7. setRemoteDescription()
     |                          8. createAnswer()
     |                          9. emit("answer")
     |                                      |
     |  10. emit("candidate")              |
     |          ↓                           |
     |    [信令服务器]                       |
     |    - 检测 .local                     |
     |    - 替换为真实 LAN IP  ← mDNS 修复  |
     |          ↓                           |
     |                          11. addIceCandidate()
     |                                      |
     |  ←——— P2P 视频流（直连）———→         |
```

