---
title: Let's Encrypt + Certbot 完整使用指南
date: 2025-08-03
tags:
  - post
---



## 1. 安装 Certbot

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS 7
sudo yum install epel-release
sudo yum install certbot python3-certbot-nginx

# CentOS 8+/RHEL 8+
sudo dnf install certbot python3-certbot-nginx

# 通用方式（推荐）：Snap 安装
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# 验证安装
certbot --version
```

## 2. 申请证书前的准备工作

### 2.1 确保域名解析正确

```bash
dig yourdomain.com
nslookup yourdomain.com
curl ifconfig.me   # 确认解析到当前服务器公网 IP
```

### 2.2 检查防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443

# CentOS/RHEL
sudo firewall-cmd --add-service=http --permanent
sudo firewall-cmd --add-service=https --permanent
sudo firewall-cmd --reload
```

### 2.3 Nginx 基础配置

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
        allow all;
        try_files $uri =404;
    }
    
    location / {
        root /var/www/html;
        index index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/yourdomain.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo mkdir -p /var/www/html && sudo chown -R www-data:www-data /var/www/html
```

## 3. 申请 SSL 证书

### 3.1 正式环境申请（推荐）

```bash
# 单域名
sudo certbot --nginx -d yourdomain.com

# 多域名
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3.2 测试申请（避免浪费正式环境额度）

Let's Encrypt 每个域名每周最多 50 次证书签发。如果你在调试 Nginx 或脚本，建议使用测试环境：

```bash
sudo certbot --nginx --staging -d yourdomain.com
```

验证成功后再去掉 `--staging` 重新申请正式证书。

### 3.3 非交互式脚本化申请

```bash
sudo certbot --nginx \
    -d yourdomain.com \
    -d www.yourdomain.com \
    --non-interactive \
    --agree-tos \
    --email your@email.com \
    --redirect
```

### 3.4 验证证书

```bash
sudo certbot certificates
curl -I https://yourdomain.com
```

## 4. 自动续期配置

### 4.1 检查续期方式

```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
ls -la /etc/cron.d/certbot
```

### 4.2 启用 systemd 定时器

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo systemctl list-timers certbot.timer
```

### 4.3 测试自动续期

```bash
sudo certbot renew --dry-run
```

## 5. 证书管理常用命令

```bash
sudo certbot certificates
sudo certbot certificates --cert-name yourdomain.com
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout
```

## 6. 故障排除

### 6.1 常见问题

**403 Forbidden**
检查验证目录权限：

```bash
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
echo "test" | sudo tee /var/www/html/.well-known/acme-challenge/test
curl http://yourdomain.com/.well-known/acme-challenge/test
```

**DNS 解析失败**

```bash
dig yourdomain.com @8.8.8.8
dig yourdomain.com @1.1.1.1
```

**80 端口无法访问**

```bash
sudo systemctl status nginx
sudo ss -tlnp | grep :80
sudo ufw status
```

### 6.2 日志查看

```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u certbot.timer -f
```

---

## 附录 A：手动续期

```bash
# 续期所有即将到期的证书
sudo certbot renew

# 强制续期特定证书
sudo certbot renew --cert-name yourdomain.com --force-renewal

# 续期后自动重载 Nginx
sudo certbot renew --post-hook "systemctl reload nginx"
```

