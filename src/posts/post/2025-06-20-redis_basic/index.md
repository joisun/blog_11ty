---
title: redis basic
date: 2025-06-20
tags:
  - post
---

## 一、Quick Glance

1. ### what ?

   Remote dictionary server, 用于数据库DB，缓存Cache，消息队列MQ 等场景。 也是目前最热门的NoSQL 数据库之一。

2. ### Why ?

   传统的数据库是基于IO的磁盘存储，Redis 是存储于内存中，实现高效访问。 也叫基于内存的数据库系统。

3. ### Intro

   Redis 支持多种数据结构。 包括

   | 5 种基本数据类型     | 5 种高级数据类型    |
   | -------------------- | ------------------- |
   | 字符串 String (默认) | 消息队列 Stream     |
   | 列表 List            | 地理空间 Geospatial |
   | 集合 List            | HyerLogLog          |
   | 有序集合 SortedSet   | 位图 Bitmap         |
   | 哈希 Hash            | 位域 Bitfield       |

## 二、Usage

Redis 可以使用多种方式使用: CLI、API、GUI

### 安装redis

```bash
# mac
brew install redis
# linux
yum/apt install redis
```

### redis-cli

```bash
redis-cli # 该命令就可以直接进入 redis 交互命令行了
```

redis 使用键值存储， 可以通过下面的命令进行 get/set 操作

```bash
redis-cli
127.0.0.1:6379> SET name hello
OK
127.0.0.1:6379> GET name
"hello"
127.0.0.1:6379> EXISTS name # EXISTS 命令用于判断键的存在
(integer) 1 # 1表示存在 0表示不存在
127.0.0.1:6379> DEL name # DEl 命令用于删除键
(integer) 1
127.0.0.1:6379> KEYS * # KEYS 命令用于查找键
1) "blue_color"
2) "red_color"
127.0.0.1:6379> KEYS *or # 模糊搜索 以'or' 结尾的键
1) "blue_color"
2) "red_color"
127.0.0.1:6379> KEYS *OR # 大小写敏感
(empty array)
127.0.0.1:6379> FLUSHALL # FLUSHALL 命令用于清空所有键
OK
127.0.0.1:6379> KEYS *
(empty array)
```

Redis 默认以二进制字符串存储数据

```bash
127.0.0.1:6379> SET hello 你好
OK
127.0.0.1:6379> GET hello #中文被存储为二进制字符串，直接无法回显
"\xe4\xbd\xa0\xe5\xa5\xbd"
127.0.0.1:6379> quit

redis-cli --raw # 携带 --raw 参数重新进入
127.0.0.1:6379> GET hello
你好
```

设定带有过期时间的键值对

```bash
127.0.0.1:6379> TTL hello # TTL 命令用于查看键值的有效时长，即 Time To Live
-1 # 永久

127.0.0.1:6379> EXPIRE hello 10 # 使用 EXPIRE 设定过期时间 （10s）
1
127.0.0.1:6379> TTL hello
7
127.0.0.1:6379> TTL hello
-2 # 已经过期

127.0.0.1:6379> SETEX name 5 Hihihi! # 可以使用 SETEX 命令直接设定带有过期时间的键值， 格式为 `SETEX <key> <expire-time> <value>`
OK
```

### List

List 也叫列表， 一般用于存储和操作一组有顺序的数据， 可数组类似

可以使用 `LPUSH` 将元素添加到列表的头部(LEFT)，或者使用 `RPUSH` 将元素添加到列表的尾部(RIGHT)。

```bash
127.0.0.1:6379> LPUSH letter a # 头部添加字母a (注意列表key为letter,如果没有会自动创建)
1
127.0.0.1:6379> LPUSH letter b # [b,a]
2
127.0.0.1:6379> LPUSH letter c # [c,b,a]
3
127.0.0.1:6379> RPUSH letter d # [c,b,a,d]
4
127.0.0.1:6379> LRANGE letter 0 -1 # LRANGE 用于获取元素， -1 指的是列表末尾
c
b
a
d
127.0.0.1:6379> RPUSH letter e f g # 可以一次添加多个元素
7
127.0.0.1:6379> LRANGE letter 0 -1
c
b
a
d
e
f
g
127.0.0.1:6379> LPOP letter # LPOP/RPOP 用于删除元素
c
127.0.0.1:6379> LRANGE letter 0 -1
b
a
d
e
f
g
127.0.0.1:6379> LPOP letter 3 # 删除多个元素
b
a
d
127.0.0.1:6379> LRANGE letter 0 -1
e
f
g
```

List - 保留指定范围元素

```bash
127.0.0.1:6379> RPUSH letter a b c d e f g
7
127.0.0.1:6379> LRANGE letter 0 -1
a
b
c
d
e
f
g
127.0.0.1:6379> LTRIM letter 1 3 # 保留索引位从 1 到 3 的元素，其他的全部删除
OK
127.0.0.1:6379> LRANGE letter 0 -1
b
c
d
```

### Set

Set 是一种不重复的无序集合， 它和列表的区别在于列表中的元素是有序可重复的。

```bash
 127.0.0.1:6379> SADD colors red # SADD 用于向Set中添加元素(同样的如果没有则会创建)
1
127.0.0.1:6379> SADD colors green blue yellow red red red # 批量添加, 且重复元素幂等
3
127.0.0.1:6379> SMEMBERS colors # 查看元素
red
green
blue
yellow
127.0.0.1:6379> SISMEMBER colors blue # SISMEMBER (S-IN-SMEMEBER) 可以用于判断元素是否存在于SET 中
1
127.0.0.1:6379> SISMEMBER colors white
0

127.0.0.1:6379> SREM colors red # SREM (S-REMOVE) 用于删除元素
1
127.0.0.1:6379> SREM colors yellow blue
2
127.0.0.1:6379> SMEMBERS colors
green
```
