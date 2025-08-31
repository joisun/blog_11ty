---
title: RESTFUL_API
date: 2023-04-05
tags:
  - post
---

REST APIS 旨在通过HTTP 的动作语义METHOD, 以替代各种传统CRUD 操作所带来的命名问题，例如 "/userAdd"、"/userDelete"、"/userUpdate"、"/userGet"。 REST API 使得你可以仅通过 "/user" + METHOD 替代上述不同的路由。

使用以下提供的信息以帮助确定何种Method,以应用不同场景：

[toc]

## 1.HTTP GET

使用 _GET_ 请求获取资源信息 - 且不要以任何方式修改资源，因为 GET 请求不提倡修改资源状态，由此也被称为safe methods。
此外，GET APIs 应该是等幂的。 即除非其他的 API （POST or PUT) 修改了服务器资源状态，任何时候发送多次完全相同的 GET 请求应当返回完全相同的数据。

### 1.1 GET API 响应码#Response Codes

- 对于任何给定的 HTTP GET API。 如果能在服务器上找到相应的资源，都必须返回 `code 200(ok)` -以及 response body. 通常根据平台实现，返回 xml 或者 json 内容。

- 万一在服务器上没有找到资源，则API 必须返回 HTTP response code 404 (NOT FOUND)

- 如果检测到 GET 请求本身是错误的，服务器应当返回 HTTP response code 400 (BAD REQUEST)

### 1.2 示例URIs

```http
HTTP GET http://www/appdomin.com/users
HTTP GET http://www/appdomin.com/users?size=20&page=5
HTTP GET http://www/appdomin.com/users/123
HTTP GET http://www/appdomin.com/users/123/address
```

## 2. HTTP POST

POST APIs 用以创建新的子级资源，例如：某个目录下的子文件，又或者某个 数据库表的新增行。
当谈及 REST。 POST 方法是用于 给某个集合资源对象 **创建一个新的资源**
除非 响应包含了适当的 `Cache-Control`或者 `Expires` 头字段，该METHOD 的想用是不能够被缓存的。
请注意，POST 请求，既不 安全，也不幂等。 并且 调用两次完全相同的 POST 请求将会导致产生包含除了id,其他完全相同信息的两个不同的资源。

### 2.1 POST API Response Codes

- 理想情况下，如果一个资源已经在服务器上创建过了， 那么响应应该是： HTTP response code 201(Created), 且包含 1. 描述请求状态和引用新资源的实体；2.一个 [Location](https://en.wikipedia.org/wiki/HTTP_location) 头。

- 很多时候，POST 方法执行的操作可能返回了一个不能被URI 所标识的资源。 在这种情况下，也应该响应 HTTP response code 200(OK) 或者 204(No Content) 。

### 2.2 示例 URIs

```http
HTTP POST http://www/appdomin.com/users
HTTP POST http://www/appdomin.com/users/123/accounts
```

## 3. HTTP PUT

PUT APIs 主要是用于 **更新一个既存的资源(如果这个资源不存在，则该API也可以选择要不要创建一个新的资源）**。
如果这个请求 通过了一个缓存， 并且 request-uri 标识了一个或多个当前缓存的实体，那么这些条目应当被视作过时的。 PUT 方法的响应式**不可缓存的**。

### 3.1 PUT API Response Codes

- 如果已经有一个被 PUT API 创建的新资源， 那么服务必须返回 HTTP response code 201(Created) 响应。

- 如果一个存在的资源被修改了， 那么服务器应该返回 200 (OK) 或者 204 (No Content) 响应状态码，以告知请求成功完成。

### 示例 URIs

```http
HTTP PUT http://www/appdomin.com/users/123
HTTP PUT http://www/appdomin.com/users/123/accounts/456
```

> [POST 和 PUT APIs 的区别(https://restfulapi.net/rest-put-vs-post/) 能够从请求 URIs 观察一二： POST 请求是针对资源集合
> 对象发出的， 而 PUT 请求则是针对单个资源。

## 4. HTTP DELETE

顾名思义，DELETE APIs 用于**删除资源**(由请求 URI 标识)。
DELETE 操作是等幂的，如果你DELETE一个资源，那么它会从资源集合中移除掉目标
有些人可能认为这使得DELETE方法是非幂等的。这是讨论和个人意见的问题。
如果这个请求 通过了一个缓存， 并且 request-uri 标识了一个或多个当前缓存的实体，那么这些条目应当被视作过时的。 DELETE 方法的响应式**不可缓存的**

### 4.1 DELETE API Response Codes

- 如果想用包含了状态描述的实体#If the response includes an rntity describing the status，一个 DELETE 请求的成功响应，应该是 HTTP response code 200(OK)

- 如果该操作处于等待队列中，那么应该返回 202 (Accepted) 。

- 如果操作已经执行，但是响应无实体，那么返回状态码应该是 204 （No Content)。

- 对同个资源重复操作 DELETE API将不会改变输出 —— 然而， 当对一个 资源执行第二次操作的时候一般会返回 404（NOT FOUND) 应为它已经被删除掉了。

### 4.2 示例 URIs

```http
HTTP DELETE http://www.appdomin.com/users/123
HTTP DELETE http://www.appdomain.com/users/123/accouts/456
```

## 5. HTTP PATCH

HTTP PATCH 请求被用于对一个资源进行部分更新 #to make a partial update
如果你看到一个PUT 请求也在修改一个资源实体，那么让它更加精确 —— PATCH METHOD 就是正确的选择专用于部分更新一个既存资源。 并且。你应该仅在需要替换某个资源的时候使用 PUT 请求。

请注意，如果你决定在你的应用中使用 PATCH APIs，也有一些挑战需要注意：

浏览器，服务器，以及web应用框架对PATCH 的支持并不是统一的， IE8，PHP， Tomcat. Django 等等都对 PATCH 不支持或者缺乏支持。

PATCH 请求的 payload#载荷 并不像 PUT 请求那样简单，例如：

```http
HTTP GET /user/1
```

产生如下响应：

```json
{ "id": 1, "username": "admin", "email": "email@example.org" }
```

一个简单的PATCH 请求以更新email将会像下面这样：

```http
HTTP PATCH /users/1
[{ "op": "replace", "path":"/email", "value": "new.email@example.org" }]
```

根据以下 HTTP 规范，可能会有以下操作：

```json
[
  { "op": "test", "path": "/a/b/c", "value": "foo" },
  { "op": "remove", "path": "/a/b/c" },
  { "op": "add", "path": "/a/b/c", "value": ["foo", "bar"] },
  { "op": "replace", "path": "/a/b/c", "value": 42 },
  { "op": "move", "from": "/a/b/c", "path": "/a/b/c" },
  { "op": "copy", "from": "/a/b/c", "path": "/a/b/c" }
]
```

> PATCH Method 请不是 POST 或者 PUT Methods 的替代品，它不同于替换整个资源

## 6. HTTP Methods 总结

下表是上述讨论的HTTP methods 的使用总结

The below table summarises the use of HTTP methods discussed above.

| **HTTP Method** | **CRUD**              | **Collection Resource (e.g. /users)**                                                                   | **Single Resouce (e.g. /users/123)**                                             |
| --------------- | --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **POST**        | Create                | 201 (Created), ‘Location’ header with link to /users/{id} containing new ID                             | Avoid using POST on a single resource                                            |
| **GET**         | Read                  | 200 (OK), list of users. Use pagination, sorting, and filtering to navigate big lists                   | 200 (OK), single user. 404 (Not Found), if ID not found or invalid               |
| **PUT**         | Update/Replace        | 405 (Method not allowed), unless you want to update every resource in the entire collection of resource | 200 (OK) or 204 (No Content). Use 404 (Not Found), if ID is not found or invalid |
| **PATCH**       | Partial Update/Modify | 405 (Method not allowed), unless you want to modify the collection itself                               | 200 (OK) or 204 (No Content). Use 404 (Not Found), if ID is not found or invalid |
| **DELETE**      | Delete                | 405 (Method not allowed), unless you want to delete the whole collection — use with caution             | 200 (OK). 404 (Not Found), if ID not found or invalid                            |

## 7.相关术语#Glossary

### 7.1 Safe Methods

如果 Methods 的语义化定义本质上是只读的，那么就被认为 Methods 是安全的。 客户端不会请求，也不会期望由于对目标资源应用安全方法而导致源服务器上的任何状态更改。

**GET, HEAD, OPTIONS, TRACE** methods 被认为是**安全 methods**, 就像每个 HTTP 定义的， GET 和 HEAD methods 应该仅被用于资源的获取，且不会更新/删除 服务器上的资源。

区分安全和非安全methods的目的在于，允许自动获取资源处理（如爬虫）获取数据，而不用担心造成损害。

安全methods 允许用户代理#agents 其他methods,例如 POST, PUT, DELETE. 以这种独特的方式，使用户意识到可能正在要求采取不安全操作的事实 - 他们可以在服务器上更新/删除资源，因此应仔细使用。

### 7.2 Idempotent Methods #幂等方法

如果一次和多次操作所造成的结果均相同，这就是幂等这个词的含义。

在HTTP 中， **PUT, DELETE** 以及上述的**safy methods (GET, HEAD, OPTIONS, TRACE)** 都是**幂等操作**。

> translate @from [resuful api](https://restfulapi.net/http-methods/)
