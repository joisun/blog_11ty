#! /bin/bash

# 验证标题是否合法的函数
validate_title() {
    local title=$1
    if [[ "$title" =~ [[:space:][:punct:]] ]]; then
        echo "标题包含特殊字符或空格，请重新输入。"
        return 1
    fi
}

# 提示用户输入标题，直到输入合法为止
while true; do
    read -p "请输入标题: " title
    if validate_title "$title"; then
        break
    fi
done

# 创建文件夹和切换到该目录
mkdir "./posts/Others/$(date '+%Y-%m-%d')-$title"
cd "./posts/Others/$(date '+%Y-%m-%d')-$title/"

# 创建 index.md 文件并创建 assets 文件夹
touch index.md
mkdir assets

# 将标题和其他信息写入 index.md 文件
echo "---" > index.md
echo "title: $title" >> index.md
echo "date: $(date '+%Y-%m-%d')" >> index.md
echo "tags:" >> index.md
echo "  - post" >> index.md
echo "---" >> index.md
