---
title: Monaspace字体配置
date: '2025-09-23'
tags:
  - Tooling
  - Font
  - Tools
---



## 一、📥 下载选择
**推荐下载**：`monaspace-nerdfonts-v1.301.zip`（包含编程图标）
**替代选择**：`monaspace-variable-v1.301.zip`（文件更小，现代应用）

## 二、🎯 程序员安装方案

### 最小安装（推荐）
只需安装每个字型的 **Regular** 版本：
```
MonaspaceArgonNF-Regular.otf
MonaspaceKryptonNF-Regular.otf
MonaspaceNeonNF-Regular.otf
MonaspaceRadonNF-Regular.otf
MonaspaceXenonNF-Regular.otf
```

### 完整开发套装
安装常用变体组合：
```
MonaspaceArgonNF-Regular.otf
MonaspaceArgonNF-Bold.otf  
MonaspaceArgonNF-Italic.otf
MonaspaceArgonNF-BoldItalic.otf
```

## 三、⚙️ 编辑器配置

### VS Code
```json
{
  "editor.fontFamily": "'Monaspace Argon', monospace",
  // 下面可选，用于开启字体连字
  "editor.fontLigatures": false,
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": [
          "comment.line",
          "comment.block",
          "comment.line.double-slash",
          "comment.block.documentation"
        ],
        "settings": {
          "fontFeatures": "'calt', 'liga', 'dlig', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'ss06', 'ss07', 'ss08'"
        }
      }
    ]
  }
}
```

### JetBrains IDE
```
Settings → Editor → Font → Monaspace Argon
```

### 终端配置
**iTerm2/终端.app**：Preferences → Profiles → Text → Font → Monaspace Argon

**Windows Terminal**：
```json
{
  "fontFace": "Monaspace Argon"
}
```

## 四、🎨 字型选择指南
- **Argon**：平衡易读（推荐默认）
- **Krypton**：技术感强
- **Neon**：圆润现代  
- **Radon**：传统等宽
- **Xenon**：独特个性

## 五、💡 使用技巧
1. **开启连字**：提升代码美观度
2. **可变字体**：支持无极字重调节
3. **Nerd Fonts**：终端图标显示完整
4. **多字型混合**：不同语言使用不同字型

## 
---
**GitHub**: https://github.com/githubnext/monaspace  
