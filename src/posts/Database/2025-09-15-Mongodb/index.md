---
title: Mongodb快速指南
date: '2025-09-15'
tags:
  - post
  - mongodb
  - database
---



## 一、通过 homebrew 本地安装 Community 版本(macos)

### 1.1 快速安装

```bash
brew tap mongodb/brew
brew install mongodb-community@8.0

# 验证安装,进入 MongoDB shell, 输出类似：test> 表示安装成功。
brew services start mongodb/brew/mongodb-community@8.0
mongosh
```

### 1.2 启动 MongoDB

```bash
# 临时启动（只在当前终端有效）
mongod --config /usr/local/etc/mongod.conf

# 永久启动（开机自启）
brew services start mongodb/brew/mongodb-community@8.0

# 停止服务
brew services stop mongodb/brew/mongodb-community@8.0
```

### 1.3 配置 MongoDB（可选）

MongoDB 配置文件一般在 `/usr/local/etc/mongod.conf`，可以修改：

- 数据存储路径 `dbPath`
- 日志路径 `logPath`
- 绑定 IP（默认仅 localhost）

例如修改数据目录：

```yaml
storage:
  dbPath: /Users/yourname/mongodb/data
```

然后重新启动：

```bash
brew services restart mongodb/brew/mongodb-community
```



## 二、常用命令

```bash
# 查看数据库列表
show dbs

# 切换/创建数据库
use mydb

# 创建集合
db.createCollection("users")

# 插入数据
db.users.insertOne({name: "Alice", age: 25})

# 查询数据
db.users.find()
```



### 三、导出数据库

```bash
# 导出整个数据库
mongodump --uri="mongodb://user:password@prod-host:27017/database_name" --out="/path/to/backup/dir"
# 只导出一个特定的集合（表）
mongodump --uri="mongodb://user:password@prod-host:27017/database_name" --collection="collection_name" --out="/path/to/backup/dir"

# 导入
mongorestore --uri="mongodb://localhost:27017/local_db_name"/path/to/backup/dir/database_name
```

mysqldump -h prod-host -u user -p database_name > backup.sql



执行后，会在 /path/to/backup/dir 目录下生成一个包含 BSON 文件的数据库备份。
