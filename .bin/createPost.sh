#!/bin/bash

# 验证标题是否合法的函数
validate_title() {
    local title="$1"
    # 更新正则表达式，允许空格和中文
    if ! echo "$title" | grep -Pq '^[a-zA-Z0-9_\x{4e00}-\x{9fff} ]+$'; then
        echo "标题包含特殊字符，请重新输入。仅允许字符、字母、数字、下划线和空格"
        return 1
    fi
    return 0 # 确保返回 0 表示成功
}

# 选择 tag
selected_tag=""

selectTag() {
    # 让用户选择 tag
    post_list_values=()

    # 使用 jq 工具从 homepage.json 中提取 post_list 字段的值
    # 因为 post_list 是字符串，直接提取每个字符串
    while IFS= read -r post; do
        post_list_values+=("$post")
    done < <(jq -r '.menu[].post_list' ./_data/homepage.json)

    if [ ${#post_list_values[@]} -eq 0 ]; then
        echo "没有找到可用的 tag。"
        exit 1
    fi

    echo "请选择文章的 tag（输入数字选择）："

    select tag in "${post_list_values[@]}"; do
        if [[ -n $tag ]]; then
            selected_tag=$tag
            break
        else
            echo "无效选择，请重新输入"
        fi
    done
}

# 提示用户输入标题，直到输入合法为止
while true; do
    read -e -p "请输入标题: " title # 使用 -e 选项
    if validate_title "$title"; then
        break
    fi
done

# 将标题中的空格替换为下划线
formatted_title="${title// /_}"

# 获取 ./posts 目录下的子目录列表
directories=($(ls -d ./posts/*/ | cut -d '/' -f 3))

# 提示用户选择目录
echo "请选择目录（输入数字）："
select dir in "${directories[@]}"; do
    if [[ -n $dir ]]; then
        selected_dir=$dir
        break
    else
        echo "无效选择，请重新输入"
    fi
done

# 获取 Tag
selectTag # 函数调用

# 创建文件夹并切换到该目录
new_dir="./posts/$selected_dir/$(date '+%Y-%m-%d')-$formatted_title"
mkdir -p "$new_dir" || { echo "创建目录失败"; exit 1; }
cd "$new_dir" || { echo "切换目录失败"; exit 1; }

# 创建 index.md 文件并创建 assets 文件夹
touch index.md
mkdir -p assets

# 将标题和其他信息写入 index.md 文件
{
    echo "---"
    echo "title: ${title//_/ }" # 保留原标题格式带空格
    echo "date: $(date '+%Y-%m-%d')"
    echo "tags:"
    echo "  - $selected_tag"
    echo "---"
} > index.md