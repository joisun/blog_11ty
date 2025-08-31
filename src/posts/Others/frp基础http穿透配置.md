---
title: frp基础http穿透配置
date: 2022-05-14
tags:
  - post
---

[TOC]

frp 用于内网穿透，支持多种协议，是一种将局域网访问暴露至公网的穿透技术。 以 http 为例，我需要公网能够直接访问到为我本地机器上的开发项目（web应用。）

frp 和 花生壳 的区别在于，花生壳简单易用，但是收费且有带宽限制。 frp 需要自己搭建客服双端。 需要一个公网服务器， 借用公网和本地机器通信，从而实现公网访问本地机器的目的， 这里的公网服务器作为中间层，类似一个转发代理。

> 本文主要是为了记录，在配置是遇到的一个小问题，找不到解决方法，所以记录一下：
>
> 遇到的问题是配置万完后启动客户端，报出下面错误导致不能成功访问：
>
> start error: port unavailable

### 1. 下载 解压 frp 程序

[https://github.com/fatedier/frp/releases](https://github.com/fatedier/frp/releases?spm=a2c6h.12873639.article-detail.7.599c2ee7CE5mDY)

```bash
$ wget https://github.com/fatedier/frp/releases/download/v0.44.0/frp_0.44.0_linux_amd64.tar.gz
$ tar -xvf  frp_0.44.0_linux_amd64.tar.gz
```

下载的程序中，有客户端（frpc） + 服务端(frps) 两组:

```bash
jayce@jayce:frp_0.44.0_linux_amd64$ tree
.
├── frpc # 客户端软件
├── frpc_full.ini
├── frpc.ini #  客户端配置文件
├── frpc.log
├── frps # 服务端软件
├── frps_full.ini #  服务端配置文件
├── frps.ini
└── LICENSE
```

本地机器保留客户端， 服务器保留服务端。 可以选择将两组程序分别放置， 也可以各自下载一套，只用对应的部分。

### 2. 服务端配置：

1. 下载好服务端程序后，将解压后的文件移动至服务端 /usr/local ， **本教程以 服务端 ip为 12.34.56.78 为例**

   ```bash
   mkdir /usr/local/frp
   mv frp_0.38.0_linux_amd64/* /usr/local/frp/
   ```

2. 配置 systemctl 接管 frp 的运行

   新建 /usr/lib/systemd/system/frp.service

   ```bash
   $ sudo vim /usr/lib/systemd/system/frp.service
   ```

   写入以下内容，注意上文移动放置的路径和此处有关。这里是启动的**服务端**。

   ```bash
   [Unit]
   Description=The nginx HTTP and reverse proxy server
   After=network.target remote-fs.target nss-lookup.target

   [Service]
   Type=simple
   ExecStart=/usr/local/frp/frps -c /usr/local/frp/frps.ini
   KillSignal=SIGQUIT
   TimeoutStopSec=5
   KillMode=process
   PrivateTmp=true
   StandardOutput=syslog
   StandardError=inherit

   [Install]
   WantedBy=multi-user.target
   ```

   重新加载服务的配置文件

   ```bash
   $ systemctl daemon-reload
   ```

   现在就可以用 systemctl 套装来控制 frp 了。

   **启动/停止/重启，查看状态，设置开机自启/关闭开机自启**

   ```bash
   systemctl start frp
   systemctl stop frp
   systemctl restart frp
   systemctl status frp
   systemctl enable frp
   systemctl disable frp
   ```

   3. 配置服务端配置文件：

   ```bash
   sudo vim /usr/local/frp/frps.ini
   ```

   ```bash
     1 [common]
     2 #frp 服务端口
     3 bind_port = 9999
     4 #http 服务通信端口
     5 vhost_http_port = 8888
     6 #https 服务通信端口，（服务器未支持，或不需要 可以不配置）
     7 vhost_https_port = 8889
     8 #日志输出文件
     9 log_file = ./frps.log
    10 log_level = info
    11
    12 #后台管理面板服务端口以及账户密码
    13 dashboard_port = 7500
    14 dashboard_user = admin
    15 dashboard_pwd = 1234
    16
    17 #frp最大建立连接数量，默认为5
    18 max_pool_count = 50
   ```

   启动服务端 frp 服务：

   ```bash
   $ systemctl start frp
   # 查看运行状态
   $ systemctl status frp
   ```

3. 对外开放云平台服务器端口

   > 略， 但确保上述配置的端口，都需要开放。

### 4. 客户端配置：

1. 进入 frpc 文件所在目录, 编辑客户端配置文件 frpc.ini：

   ```bash
   $ vim frpc.ini
   ```

   ```bash
   [common]
   server_addr = 12.34.56.78 # 你的公网服务器 IP 地址
   server_port = 9999 # 你公网服务器 frps 配置的通信端口，需要和上面的 frps.ini `bind_port` 配置保持一致

   [web]
   type = http #协议类型
   local_ip = 127.0.0.1 # 本地机器IP 地址，（就是当前配置文件，frpc.ini 所在的客户端，默认就是 127.0.0.1, 所以也可以不写）
   local_port = 5467  # 本地机器 需要被暴露出去的 web应用服务端口（我需要将本地机器上的一个vue 项目暴露出去，其 devServer.port 配置的是 5467, 这不是固定的）
   remote_port = 8888 # 公网服务器 frps.ini 中 `vhost_http_port` 的http 通信地址，如果 默认是 80 端口，如果就用默认端口， 那么 frps.ini 中的 `vhost_http_port`  和这里的 `remote_port` 都可以不写，保持默认即可
   custom_domains = 12.34.56.78 # type 为 http 时，必填，为你公网服务器绑定的 能够正常解析的域名地址， 如果没有，就写 公网IP 就行。
   ```

   > :warning: 注意，type为 http 时， `custom_domains` 这个字段必须要配置， 如果公网服务器购买过并绑定过 域名，这里就填写 域名， 如果没有，就填写公网服务器IP 地址。必须要写，否则会报错 post unavailable。

2. 启动客户端：

   ```bash
   $ ./frpc -c frpc.ini
   ```

   如下输出为正常启动：

   ```bash
   ...
   2022/08/28 20:13:17 [I] [control.go:181] [c864e521ba457c00] [web] start proxy success
   ...
   ```

### 5. 测试连接

浏览器尝试访问 : http://12.34.56.78:8888, 看能不能成功访问 开发机上的web应用。

参考：

https://developer.aliyun.com/article/853534

https://www.bilibili.com/video/BV1PY4y1F7cb?spm_id_from=333.337.search-card.all.click

https://github.com/fatedier/frp/issues/1288#issuecomment-502463457
