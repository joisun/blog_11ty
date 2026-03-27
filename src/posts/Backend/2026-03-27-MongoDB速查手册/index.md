---
title: 'MongoDB 速查手册：从连接到性能分析的完整参考'
date: '2026-03-27'
tags:
  - MongoDB
  - NoSQL
  - Database
  - Cheat Sheet
---

本文整理了 MongoDB 日常开发中最常用的命令和操作，涵盖连接、CRUD、时间查询、删除策略、聚合管道、索引、性能分析以及运维实用命令，适合收藏备查。

<!-- excerpt -->

## 一、连接

### 1.1 mongosh 连接

```javascript
// 本地默认连接
mongosh

// 指定数据库
mongosh "mongodb://localhost:27017/mydb"

// 带认证
mongosh "mongodb://user:pass@host:27017/mydb"

// Atlas 云连接
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/mydb"
```

### 1.2 连接选项

```bash
# 指定主机和端口
mongosh --host 192.168.1.100 --port 27017 --authenticationDatabase admin -u root -p

# TLS 加密连接
mongosh --tls --tlsCertificateKeyFile /path/to/cert.pem
```

## 二、数据库与集合操作

```javascript
// 数据库
show dbs                          // 列出所有数据库
use mydb                          // 切换/创建数据库
db.dropDatabase()                 // 删除当前数据库

// 集合
show collections                  // 列出所有集合
db.createCollection("users")      // 创建集合
db.users.drop()                   // 删除集合
```

## 三、CRUD 操作

### 3.1 Create

```javascript
db.users.insertOne({ name: "Alice", age: 25 })
db.users.insertMany([{ name: "Bob" }, { name: "Charlie" }])
```

### 3.2 Read

```javascript
db.users.find()                           // 全部
db.users.find({ age: { $gt: 20 } })      // 条件查询
db.users.findOne({ name: "Alice" })       // 单条
db.users.find({}, { name: 1, _id: 0 })   // 投影（只返回 name）
db.users.find().sort({ age: -1 })         // 排序
db.users.find().limit(5).skip(10)         // 分页
db.users.countDocuments({ age: { $gt: 20 } })
db.users.distinct("name")
```

### 3.3 Update

```javascript
db.users.updateOne({ name: "Alice" }, { $set: { age: 26 } })
db.users.updateMany({ age: { $lt: 18 } }, { $set: { minor: true } })
db.users.replaceOne({ name: "Alice" }, { name: "Alice", age: 27 })
db.users.findOneAndUpdate({ name: "Alice" }, { $inc: { age: 1 } })
```

### 3.4 Delete

```javascript
db.users.deleteOne({ _id: ObjectId("...") })
db.users.deleteMany({ age: { $lt: 18 } })
```

## 四、按时间排序与查询

### 4.1 利用 _id 排序

MongoDB 的 `ObjectId` 前 4 字节是时间戳，天然支持按插入时间排序：

```javascript
db.logs.find().sort({ _id: -1 })             // 最新优先
db.logs.find().sort({ _id: -1 }).limit(20)   // 最新 20 条
```

### 4.2 按时间字段排序

```javascript
db.logs.find().sort({ createdAt: -1 })       // 降序（新 → 旧）
db.logs.find().sort({ createdAt: 1 })        // 升序（旧 → 新）
```

### 4.3 时间范围查询

```javascript
// 精确范围
db.logs.find({
  createdAt: {
    $gte: ISODate("2026-03-01T00:00:00Z"),
    $lt:  ISODate("2026-03-28T00:00:00Z")
  }
}).sort({ createdAt: -1 })

// 通过 _id 查时间范围（无需时间字段）
db.logs.find({
  _id: { $gt: ObjectId.fromDate(new Date("2026-03-01")) }
})

// 最近 7 天
var daysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
db.logs.find({ createdAt: { $gte: daysAgo } })
```

## 五、删除操作详解

### 5.1 基本删除

```javascript
db.users.deleteOne({ _id: ObjectId("...") })     // 按 ID 删单条
db.users.deleteMany({ status: "inactive" })       // 批量条件删除
db.users.deleteMany({})                           // 清空集合（保留结构）
db.users.drop()                                   // 删除整个集合
```

### 5.2 查找并删除

`findOneAndDelete` 会返回被删除的文档，适合需要拿到删除结果的场景：

```javascript
db.users.findOneAndDelete({ name: "Alice" })
db.users.findOneAndDelete(
  { status: "expired" },
  { sort: { createdAt: 1 } }     // 删最早的一条
)
```

### 5.3 按时间批量清理

```javascript
db.logs.deleteMany({
  createdAt: { $lt: ISODate("2025-01-01T00:00:00Z") }
})
```

### 5.4 TTL 索引自动过期

TTL 索引让 MongoDB 在后台自动删除过期文档，非常适合 session、日志等场景：

```javascript
// 到达 expireAt 字段指定的时间后自动删除
db.sessions.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)

// 创建 24 小时后自动删除
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
)
```

### 5.5 Bulk 批量操作

```javascript
db.logs.bulkWrite([
  { deleteOne: { filter: { _id: ObjectId("...") } } },
  { deleteMany: { filter: { level: "debug" } } }
])
```

## 六、查询与更新操作符

### 6.1 查询操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `$eq` | 等于 | `{ age: { $eq: 25 } }` |
| `$ne` | 不等于 | `{ age: { $ne: 25 } }` |
| `$gt` / `$gte` | 大于 / 大于等于 | `{ age: { $gt: 20 } }` |
| `$lt` / `$lte` | 小于 / 小于等于 | `{ age: { $lt: 30 } }` |
| `$in` | 在数组中 | `{ status: { $in: ["A", "B"] } }` |
| `$nin` | 不在数组中 | `{ status: { $nin: ["C"] } }` |
| `$exists` | 字段是否存在 | `{ email: { $exists: true } }` |
| `$regex` | 正则匹配 | `{ name: { $regex: /^A/i } }` |
| `$and` | 逻辑与 | `{ $and: [{ age: { $gt: 20 } }, { age: { $lt: 30 } }] }` |
| `$or` | 逻辑或 | `{ $or: [{ age: 25 }, { name: "Bob" }] }` |

### 6.2 更新操作符

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `$set` | 设置字段值 | `{ $set: { name: "Alice" } }` |
| `$unset` | 删除字段 | `{ $unset: { temp: "" } }` |
| `$inc` | 递增 | `{ $inc: { views: 1 } }` |
| `$push` | 数组追加 | `{ $push: { tags: "new" } }` |
| `$pull` | 数组移除 | `{ $pull: { tags: "old" } }` |
| `$addToSet` | 数组去重追加 | `{ $addToSet: { tags: "unique" } }` |
| `$rename` | 重命名字段 | `{ $rename: { "old": "new" } }` |

## 七、Aggregation Pipeline

### 7.1 核心 Stage

```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },           // 过滤
  { $group: {                                     // 分组聚合
      _id: "$customerId",
      total: { $sum: "$amount" },
      count: { $sum: 1 }
  }},
  { $sort: { total: -1 } },                      // 排序
  { $limit: 10 },                                // 限制条数
  { $project: {                                   // 字段投影
      _id: 0,
      customer: "$_id",
      total: 1
  }},
  { $lookup: {                                    // 左连接（关联查询）
      from: "customers",
      localField: "customer",
      foreignField: "_id",
      as: "info"
  }},
  { $unwind: "$info" }                            // 展开数组
])
```

### 7.2 常用聚合操作符

```javascript
// 累加器
$sum, $avg, $min, $max, $first, $last

// 字符串
$concat, $substr, $toUpper, $toLower

// 日期
$year, $month, $dayOfMonth, $dateToString

// 条件
$cond, $ifNull, $switch

// 数组
$size, $filter, $map, $reduce
```

## 八、索引

### 8.1 创建索引

```javascript
db.users.createIndex({ email: 1 })                        // 单字段升序
db.users.createIndex({ name: 1, age: -1 })                // 复合索引
db.users.createIndex({ email: 1 }, { unique: true })      // 唯一索引
db.users.createIndex({ bio: "text" })                      // 文本索引
db.users.createIndex({ location: "2dsphere" })             // 地理空间索引
```

### 8.2 管理索引

```javascript
db.users.getIndexes()              // 查看所有索引
db.users.dropIndex("email_1")     // 删除指定索引
```

## 九、性能分析

### 9.1 explain 查询计划

```javascript
db.users.find({ email: "a@b.com" }).explain()                 // 基本计划
db.users.find({ email: "a@b.com" }).explain("executionStats")  // 执行统计（最常用）
db.users.find({ email: "a@b.com" }).explain("allPlansExecution")
```

**关键指标解读**：

- `executionStats.totalDocsExamined` — 扫描文档数（越小越好）
- `executionStats.nReturned` — 返回文档数
- `executionStats.executionTimeMillis` — 执行耗时 (ms)
- `winningPlan.stage` — `COLLSCAN` = 全表扫描（需优化），`IXSCAN` = 索引扫描（正常）

### 9.2 Profiler 慢查询分析

```javascript
db.setProfilingLevel(0)                   // 关闭
db.setProfilingLevel(1, { slowms: 100 })  // 记录 >100ms 的操作
db.setProfilingLevel(2)                   // 记录所有操作（调试用，生产慎用）
db.getProfilingStatus()                   // 查看当前级别

// 查询慢操作日志
db.system.profile.find().sort({ ts: -1 }).limit(10)
db.system.profile.find({ millis: { $gt: 500 } })
db.system.profile.find({ op: "query" }).sort({ millis: -1 }).limit(5)
```

### 9.3 当前操作监控

```javascript
db.currentOp()                                         // 所有正在执行的操作
db.currentOp({ "secs_running": { $gt: 5 } })          // 运行超过 5s 的
db.currentOp({ "op": "query", "active": true })       // 活跃查询
db.killOp(<opId>)                                      // 终止指定操作
```

### 9.4 统计信息

```javascript
db.stats()                         // 数据库级别统计
db.users.stats()                   // 集合级别统计
db.users.storageSize()             // 存储大小
db.users.totalSize()               // 总大小（数据 + 索引）
db.users.totalIndexSize()          // 索引大小
```

### 9.5 索引使用分析

```javascript
// 查看每个索引的使用频率
db.users.aggregate([{ $indexStats: {} }])
// 使用频率为 0 的索引可以考虑删除，节省存储和写入开销
```

### 9.6 serverStatus

```javascript
db.serverStatus().connections       // 连接数
db.serverStatus().opcounters        // CRUD 操作计数
db.serverStatus().mem               // 内存使用
db.serverStatus().wiredTiger.cache  // 存储引擎缓存
```

## 十、实用命令

### 10.1 数据导入导出

```bash
# 备份与恢复
mongodump --uri="mongodb://..." --out=/backup/
mongodump --db mydb --collection users --out=/backup/
mongorestore --uri="mongodb://..." /backup/

# JSON / CSV 导入导出
mongoexport --db mydb --collection users --out=users.json --jsonArray
mongoimport --db mydb --collection users --file=users.json --jsonArray
mongoexport --db mydb --collection users --type=csv --fields=name,email --out=users.csv
```

### 10.2 用户管理

```javascript
db.createUser({
  user: "admin",
  pwd: "secret",
  roles: [{ role: "readWrite", db: "mydb" }]
})
db.getUsers()                                  // 列出用户
db.dropUser("admin")                           // 删除用户
db.changeUserPassword("admin", "newpass")       // 修改密码
```

### 10.3 副本集

```javascript
rs.status()           // 副本集状态
rs.conf()             // 副本集配置
rs.isMaster()         // 当前节点角色
rs.stepDown()         // 主节点降级
```

### 10.4 分片

```javascript
sh.status()                                                    // 分片状态
sh.enableSharding("mydb")                                      // 启用分片
sh.shardCollection("mydb.orders", { customerId: "hashed" })   // 分片集合
```

### 10.5 常用查询技巧

```javascript
db.users.find().forEach(printjson)         // 遍历打印
db.users.find().toArray()                  // 转数组
db.users.find().map(u => u.name)           // 提取字段
db.users.estimatedDocumentCount()          // 快速估算总数（比 countDocuments 快）
db.users.distinct("status")               // 去重值列表

// 字段值分布统计
db.users.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// 查找重复数据
db.users.aggregate([
  { $group: { _id: "$email", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

// 随机抽样
db.users.aggregate([{ $sample: { size: 5 } }])

// 批量重命名字段
db.users.updateMany({}, { $rename: { "oldField": "newField" } })
```
