---
title: Nunjucks快速指南
date: '2025-12-31'
tags:
  - post
  - nunjucks
  - njk
---



Nunjucks (`.njk`) 是 Mozilla 开发的一个功能强大的 JavaScript 模板引擎。它深受 Python 的 **Jinja2** 启发。如果你用过 Python 的 Jinja2 或 Django 模板，你会觉得非常亲切。

这份指南分为 **基础语法**、**逻辑控制**、**高级复用** 和 **常用过滤器** 四个部分。

---

### 一、 核心概念：两种标签

Nunjucks 最基本的语法只有两种符号：

1.  **`{{ }}`**：**输出变量**。会把结果打印到页面上。
2.  **`{% %}`**：**执行逻辑**。用于循环、判断、定义变量，**不会**直接输出内容。

---

### 二、 基础语法 (Variables)

#### 1. 输出变量
```njk
{{ username }}
{{ user.id }}          <!-- 点语法访问属性 -->
{{ user['email'] }}    <!-- 括号语法访问属性 -->
```

#### 2. 设置默认值 (防止报错)
如果变量不存在，可以使用 `default` 过滤器：
```njk
Hello, {{ username | default("Guest") }}
```

#### 3. 定义变量 (Set)
在模板内部定义新变量：
```njk
{% set active_class = "is-active" %}
<div class="{{ active_class }}">...</div>
```

---

### 三、 逻辑控制 (Control Flow)

#### 1. 条件判断 (If / Else)
```njk
{% if user.is_admin %}
  <button>Delete User</button>
{% elif user.is_editor %}
  <button>Edit User</button>
{% else %}
  <p>You have read-only access.</p>
{% endif %}
```

#### 2. 循环 (Loops)
遍历数组或对象：

```njk
<ul>
{% for item in items %}
  <li>
    {{ loop.index }} - {{ item.title }}
    <!-- loop.index 从 1 开始，loop.index0 从 0 开始 -->
    <!-- loop.first (是否是第一个), loop.last (是否是最后一个) -->
  </li>
{% else %}
  <li>这里没有数据 (当 items 为空时显示)</li>
{% endfor %}
</ul>
```

---

### 四、 过滤器 (Filters)

过滤器用于修改变量的输出，使用管道符 `|`。

#### 常用内置过滤器
*   **`safe`**：**最重要！** 不转义 HTML（渲染 HTML 字符串）。
    ```njk
    {{ content_html | safe }}
    ```
*   **`length`**：获取数组或字符串长度。
    ```njk
    Count: {{ items | length }}
    ```
*   **`upper` / `lower`**：大小写转换。
    ```njk
    {{ "hello" | upper }}  <!-- 输出 HELLO -->
    ```
*   **`join`**：连接数组。
    ```njk
    {{ ["a", "b", "c"] | join("-") }} <!-- 输出 a-b-c -->
    ```
*   **`replace`**：替换字符串。
    ```njk
    {{ "Hello World" | replace("World", "Nunjucks") }}
    ```
*   **`truncate`**：截断长文本。
    ```njk
    {{ description | truncate(50) }}
    ```

**链式调用：**
```njk
{{ "hello world" | upper | replace("WORLD", "NJK") }}
```

---

### 五、 模板继承 (Inheritance) —— Nunjucks 的灵魂

这是 Nunjucks 最强大的地方，用于构建统一的网站布局。

#### 1. 定义父模板 (`layout.njk`)
使用 `block` 定义“坑位”，留给子页面去填。

```njk
<!-- layout.njk -->
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}默认标题{% endblock %}</title>
</head>
<body>
  <nav>导航栏</nav>

  <main>
    <!-- 这里是一个坑，名字叫 content -->
    {% block content %}{% endblock %}
  </main>

  <footer>页脚</footer>
</body>
</html>
```

#### 2. 定义子页面 (`page.njk`)
使用 `extends` 继承父模板，并把内容填入对应的 `block`。

```njk
<!-- page.njk -->
{% extends "layout.njk" %}

{% block title %}我的首页{% endblock %}

{% block content %}
  <h1>欢迎来到我的网站</h1>
  <p>这是正文内容。</p>
{% endblock %}
```

---

### 六、 组件与复用 (Macros & Includes)

#### 1. Include (简单引入)
直接把另一个文件的内容粘贴过来，适合页眉、页脚。
```njk
{% include "footer.njk" %}
```

#### 2. Macro (宏/组件)
类似于编程语言中的**函数**，用于生成可复用的 HTML 片段（如表单控件、卡片）。

**定义宏 (`forms.njk`)：**
```njk
{% macro input(name, placeholder, type="text") %}
  <div class="field">
    <input type="{{ type }}" name="{{ name }}" placeholder="{{ placeholder }}">
  </div>
{% endmacro %}
```

**使用宏：**
```njk
{% import "forms.njk" as forms %}

<form>
  {{ forms.input("username", "请输入用户名") }}
  {{ forms.input("password", "请输入密码", "password") }}
</form>
```

---

### 七、 空白控制 (Whitespace Control)

Nunjucks 默认会保留代码中的换行符和空格。如果你想生成紧凑的代码，可以使用减号 `-`。

*   `{%-` ：去除标签**左边**的空白。
*   `-%}` ：去除标签**右边**的空白。

**示例：**
```njk
<!-- 假设 tags = [1, 2, 3] -->
[{% for i in tags -%}
  {{ i }}
{%- endfor %}]
```
**输出：** `[123]` (没有多余的空格和换行)

---

### 八、 其他实用技巧

#### 1. 原始块 (Raw)
如果你需要在页面上输出 `{{ }}` 这种符号（例如你在写 Vue.js 或 Handlebars 的教程），需要禁止 Nunjucks 解析：

```njk
{% raw %}
  这里的内容不会被 Nunjucks 解析：{{ variable }}
{% endraw %}
```

#### 2. 导入上下文
`include` 默认会把当前页面的所有变量传给被引入的文件。
如果不想传，可以禁用：
```njk
{% include "component.njk" without context %}
```

### 总结速查表

| 功能         | 语法                                       |
| :----------- | :----------------------------------------- |
| **输出**     | `{{ var }}`                                |
| **逻辑**     | `{% if condition %} ... {% endif %}`       |
| **循环**     | `{% for item in items %} ... {% endfor %}` |
| **过滤器**   | `{{ var | filter }}`                       |
| **注释**     | `{# 这是一个注释 #}`                       |
| **继承**     | `{% extends "layout.njk" %}`               |
| **定义块**   | `{% block name %} ... {% endblock %}`      |
| **引入**     | `{% include "file.njk" %}`                 |
| **转义HTML** | `{{ html_str | safe }}`                    |
