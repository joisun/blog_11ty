---
title: Let's Encrypt + Certbot 完整使用指南
date: 2025-08-03
tags:
  - post
---

# Let's Encrypt + Certbot 完整使用指南

## 简介

Let's Encrypt 是一个免费、自动化的证书颁发机构，Certbot 是官方推荐的客户端工具，可以自动获取和续期 SSL 证书。

## 1. 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
# 或者较新版本
sudo dnf install certbot python3-certbot-nginx
```

## 2. Nginx 配置准备

### 2.1 基本 HTTP Server 配置

在获取证书前，确保 nginx 配置中有正确的 HTTP server 块：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt 验证路径 - 必须配置
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
        try_files $uri =404;
    }

    # 其他请求重定向到 HTTPS（获取证书后）
    location / {
        return 301 https://$host$request_uri;
    }
}
```

### 2.2 HTTPS Server 配置模板

```nginx
server {
    listen 443;  # certbot 会自动添加 ssl http2
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书配置由 certbot 自动添加

    location / {
        # 你的应用配置
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 3. 获取证书

### 3.1 检查配置和权限

```bash
# 测试 nginx 配置
sudo nginx -t

# 创建验证目录并设置权限
sudo mkdir -p /var/www/html/.well-known/acme-challenge
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 测试验证路径
echo "test" | sudo tee /var/www/html/.well-known/acme-challenge/test
curl http://yourdomain.com/.well-known/acme-challenge/test
```

### 3.2 获取证书

```bash
# 单个域名
sudo certbot --nginx -d yourdomain.com

# 多个域名
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 交互式选择（推荐新手）
sudo certbot --nginx

# 非交互式（脚本使用）
sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos --email your@email.com
```

## 4. 常见问题和解决方案

### 4.1 403 Forbidden 错误

```bash
# 检查目录权限
sudo ls -la /var/www/html/.well-known/
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 检查 nginx 配置中 location 优先级
# 确保 /.well-known/acme-challenge/ 使用 ^~ 前缀
```

### 4.2 DNS 解析问题

```bash
# 检查域名解析
nslookup yourdomain.com
dig yourdomain.com

# 确保域名指向正确的服务器 IP
```

### 4.3 速率限制

Let's Encrypt 有以下限制：

- 每个域名每小时最多 5 次失败验证
- 每个账户每周最多 50 个证书
- 遇到限制需要等待重置时间

```bash
# 查看详细错误信息
sudo certbot --nginx -v

# 检查日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## 5. 证书管理

### 5.1 查看证书状态

```bash
# 列出所有证书
sudo certbot certificates

# 检查证书到期时间
sudo certbot certificates --cert-name yourdomain.com
```

### 5.2 手动续期

```bash
# 续期所有证书
sudo certbot renew

# 续期特定证书
sudo certbot renew --cert-name yourdomain.com

# 测试续期（不实际续期）
sudo certbot renew --dry-run
```

### 5.3 自动续期

Certbot 安装时会自动设置 cron 任务或 systemd timer：

```bash
# 检查自动续期状态
sudo systemctl status certbot.timer

# 手动添加 cron 任务（如果没有自动设置）
sudo crontab -e
# 添加以下行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. 证书删除和重新申请

### 6.1 删除证书

```bash
# 删除证书但保留配置
sudo certbot delete --cert-name yourdomain.com

# 完全清理（包括 nginx 配置）
sudo certbot delete --cert-name yourdomain.com
# 然后手动清理 nginx 中的 SSL 配置
```

### 6.2 重新申请

```bash
# 强制重新申请
sudo certbot --nginx -d yourdomain.com --force-renewal
```

## 7. 高级配置

### 7.1 使用 standalone 模式

```bash
# 停止 nginx
sudo systemctl stop nginx

# 使用 standalone 模式申请
sudo certbot certonly --standalone -d yourdomain.com

# 启动 nginx
sudo systemctl start nginx

# 手动配置 nginx SSL
```

### 7.2 使用 DNS 验证

```bash
# 需要安装相应的 DNS 插件
sudo certbot certonly --manual --preferred-challenges dns -d yourdomain.com
```

## 8. 最佳实践

1. **备份证书**：定期备份 `/etc/letsencrypt/` 目录
2. **监控到期**：设置监控提醒证书到期时间
3. **测试续期**：定期运行 `certbot renew --dry-run`
4. **日志检查**：定期检查 `/var/log/letsencrypt/` 日志
5. **安全配置**：配置强加密套件和安全头

## 9. 故障排除清单

遇到问题时的检查步骤：

1. `sudo nginx -t` - 检查 nginx 配置语法
2. `curl http://domain/.well-known/acme-challenge/test` - 测试验证路径
3. `sudo tail -f /var/log/nginx/error.log` - 查看 nginx 错误日志
4. `sudo certbot --nginx -v` - 详细模式运行 certbot
5. 检查防火墙是否开放 80 和 443 端口
6. 确认域名 DNS 解析正确
7. 检查服务器时间是否正确

## 10. 常用命令速查

```bash
# 安装
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d domain.com

# 查看证书
sudo certbot certificates

# 续期测试
sudo certbot renew --dry-run

# 删除证书
sudo certbot delete --cert-name domain.com

# 查看日志
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

**记住**：Let's Encrypt 证书有效期为 90 天，但 certbot 会自动设置续期任务。第一次设置成功后，后续基本无需手动干预！
