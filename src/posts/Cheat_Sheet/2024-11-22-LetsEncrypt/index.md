---
title: LetsEncrypt
date: 2024-11-22
tags:
  - SSL
  - HTTPS
  - Certbot
  - 网站安全
  - Let's Encrypt
---



### Certbot 是什么？

Certbot 是一个开源工具，用于自动获取和管理来自 [Let's Encrypt](https://letsencrypt.org/) 的免费 SSL/TLS 证书。它支持大多数现代 Web 服务器（如 Apache 和 Nginx）以及许多主流操作系统，帮助用户轻松配置 HTTPS。

Certbot 的主要功能包括：

1. **自动获取证书**：从 Let's Encrypt 自动申请 SSL/TLS 证书。
2. **自动配置 HTTPS**：修改 Web 服务器配置以启用 HTTPS（支持 Apache 和 Nginx）。
3. **自动续期**：在证书到期前自动续期，确保服务不中断。

------

### 如何使用 Certbot？

#### 1. **安装 Certbot**

Certbot 提供多种安装方式，取决于你的操作系统和 Web 服务器。以下是常见安装方法：

- **Ubuntu/Debian：**

  ```bash
  sudo apt update
  sudo apt install certbot python3-certbot-nginx
  ```

  > `python3-certbot-nginx` 是为 Nginx 用户准备的插件。如果使用 Apache，请安装 `python3-certbot-apache`。

- **CentOS/RHEL：**

  ```bash
  sudo yum install epel-release
  sudo yum install certbot python3-certbot-nginx
  ```

- **其他系统**：可以参考 Certbot 官方文档：[Certbot Installation Guide](https://certbot.eff.org/).

------

#### 2. **申请证书**

根据使用的 Web 服务器，Certbot 提供不同的命令：

- **为 Nginx 自动申请和配置证书：**

  ```bash
  sudo certbot --nginx
  ```

  Certbot 会自动检测 Nginx 配置文件并申请证书，同时更新配置文件以启用 HTTPS。

- **为 Apache 自动申请和配置证书：**

  ```bash
  sudo certbot --apache
  ```

- **仅申请证书（不修改配置）：**

  ```bash
  sudo certbot certonly --standalone
  ```

  > `--standalone` 模式适合没有 Web 服务器或需要手动配置的场景。

------

#### 3. **测试 HTTPS**

申请证书后，访问你的域名（如 `https://yourdomain.com`）以验证 HTTPS 是否正常工作。

------

#### 4. **自动续期**

Let's Encrypt 的证书有效期为 90 天，Certbot 提供自动续期功能：

- 测试续期是否正常工作：

  ```bash
  sudo certbot renew --dry-run
  ```

- 配置自动续期（大多数系统会自动添加到 `cron` 或 `systemd` 中）。如果没有自动化，可以手动添加到 `cron`：

  ```bash
  0 0,12 * * * certbot renew --quiet
  ```

------

#### 5. **其他常用命令**

- 列出已管理的证书：

  ```bash
  sudo certbot certificates
  ```

- 手动删除证书：

  ```bash
  sudo certbot delete
  ```

- 查看帮助文档：

  ```bash
  certbot --help
  ```

------

### 总结

Certbot 是一个强大的工具，特别适合需要快速、安全地启用 HTTPS 的开发者。通过 Certbot，用户可以轻松申请、配置和管理 SSL/TLS 证书，大大降低了使用 HTTPS 的门槛。

---

### 如何检查是否有自动续期配置

要检查你的系统是否已自动配置 Certbot 的续期，可以根据操作系统使用的计划任务管理工具（`cron` 或 `systemd`）进行检查。以下是方法：

------

### **1. 检查 systemd 定时任务**

Certbot 通常在现代 Linux 系统中使用 `systemd` 定时任务。

- **查看 systemd 定时任务是否存在：**

  ```bash
  systemctl list-timers --all | grep certbot
  ```

  输出中如果有类似 `certbot.timer` 的项，说明 Certbot 已通过 systemd 自动配置续期。

- **检查 `certbot.timer` 的状态：**

  ```bash
  systemctl status certbot.timer
  ```

  如果状态显示为 `active` 或 `enabled`，说明定时任务正在运行。

------

### **2. 检查 cron 定时任务**

在一些系统（如旧版 Ubuntu 或不支持 `systemd` 的系统）中，Certbot 可能通过 `cron` 实现续期。

- **查看 cron 的配置文件：** Certbot 的续期任务可能位于以下位置之一：

  - `/etc/cron.d/certbot`

  - 用户级别的 

    ```
    cron
    ```

     配置中，使用以下命令查看：

    ```bash
    crontab -l
    ```

  在这些配置文件中，找类似以下的内容：

  ```bash
  0 */12 * * * certbot renew --quiet
  ```

  如果存在类似的条目，说明 Certbot 的续期已通过 `cron` 配置。

------

### **3. 手动测试续期**

无论是否自动配置，可以通过以下命令测试续期功能是否正常工作：

```bash
sudo certbot renew --dry-run
```

- 如果输出显示类似 `Congratulations, all renewals succeeded!`，说明自动续期功能可正常使用。

------

### **4. 如果没有自动配置**

如果没有发现自动续期配置，可以根据需要手动添加：

- **为 `systemd` 添加定时器：**

  ```bash
  sudo systemctl enable certbot.timer
  sudo systemctl start certbot.timer
  ```

- **为 `cron` 添加定时任务：** 编辑 `cron` 配置文件（如 `/etc/crontab` 或 `/etc/cron.d/certbot`）：

  ```bash
  0 */12 * * * certbot renew --quiet
  ```

这会每 12 小时检查一次证书是否需要续期。

------

### 总结

运行 `systemctl list-timers --all | grep certbot` 或检查 `/etc/cron.d/` 是最简单的方法来验证自动续期配置。测试续期命令 `certbot renew --dry-run` 可以确保自动续期功能正常工作。
