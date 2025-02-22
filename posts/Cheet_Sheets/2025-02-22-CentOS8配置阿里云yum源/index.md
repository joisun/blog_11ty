---
title: CentOS8 配置阿里云yum源
date: 2025-02-22
tags:
  - Cheat_Sheet
---

## 脚本

**`script.sh`**

```bash
#! /bin/bash
rename '.repo' '.repo.bak' /etc/yum.repos.d/*.repo

echo "----------------rename finished!----------------"


wget http://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo -O /etc/yum.repos.d/Centos-vault-8.5.2111.repo
wget http://mirrors.aliyun.com/repo/epel-archive-8.repo -O /etc/yum.repos.d/epel-archive-8.repo

echo "----------------repo downloaded!----------------"

sed -i 's/http:\/\/mirrors.cloud.aliyuncs.com/url_tmp/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo && sed -i 's/url_tmp/http:\/\/mirrors.aliyun.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo

echo "----------------repo fixed!----------------"

yum clean all && yum makecache

echo "----------------yum cleaned----------------"

```

> 我是在给我局域网一台电脑 【B】 装虚拟机，当前操作电脑为【A】，虚拟机是最小化安装的，没有 GUI， 在 vmware workstation 中，所以我是在 【A】上写好脚本，然后在 【B】上下载下来执行的。 如果你是手动安装，直接拷贝上面的脚本去执行就可以了。

## 安装 serve 静态资源文件服务器

电脑【A】：`cd path/to/the/script.sh`

```bash
$ brew install serve
$ serve .
```

> 默认暴露端口为 8080

记录资源 url 地址为：`<your-local-ip-address>:8080/script.sh`

## CentOS 下载并执行脚本

电脑【B】虚拟机：

```bash
$ mkdir ~/tmp;cd ~/tmp;
$ wget <your-local-ip-address>:8080/script.sh
$ chmod +x ./script.sh
$ ./script.sh
```

done.

> 参考：https://www.alibabacloud.com/help/zh/ecs/user-guide/change-centos-8-repository-addresses
