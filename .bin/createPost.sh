#!/bin/bash

# 验证标题是否合法的函数 - 使用简化的方法
validate_title() {
    local title="$1"
    
    # 清理隐藏字符
    local cleaned_title=$(echo "$title" | tr -d '\000-\011\013-\037\177')
    
    # 我们接受所有输入，但会警告用户某些字符可能在文件名中被替换
    # 检查是否包含文件名中不安全的字符
    if echo "$cleaned_title" | grep -q '[/\\:*?"<>|]'; then
        echo "警告：标题包含在文件名中不安全的字符 (/\\:*?\"<>|)，这些字符将被替换为下划线。"
        echo "是否继续？(y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0 # 接受所有输入
}

# 清理文件名不合法字符的函数
sanitize_filename() {
    local input="$1"
    # 1. 先将空格替换为下划线
    local result=$(echo "$input" | sed 's/ /_/g')
    # 2. 只替换文件名中不安全的字符为下划线，保留中文和其他有效字符
    result=$(echo "$result" | sed 's/[\/\\:*?"<>|]/_/g')
    echo "$result"
}

# 验证日期格式是否正确
validate_date() {
    local date_input="$1"
    
    # 如果输入为空，返回成功（将使用当前日期）
    if [ -z "$date_input" ]; then
        return 0
    fi
    
    # 检查日期格式是否为 YYYY-MM-DD
    if ! [[ "$date_input" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
        echo "日期格式不正确，请使用 YYYY-MM-DD 格式。"
        return 1
    fi
    
    # 检查日期是否有效
    # 使用 date 命令尝试解析日期，如果失败则日期无效
    if ! date -j -f "%Y-%m-%d" "$date_input" > /dev/null 2>&1; then
        echo "无效的日期，请输入有效的日期。"
        return 1
    fi
    
    return 0
}

# 选择 tag
selected_tag=""

selectTag() {
    # 让用户选择 tag
    folder_name_values=()

    # 使用 jq 工具从 homepage.json 中提取 folder_name 字段的值
    # 因为 folder_name 是字符串，直接提取每个字符串
    while IFS= read -r post; do
        folder_name_values+=("$post")
    done < <(jq -r '.menu[].folder_name' ./_data/homepage.json)

    if [ ${#folder_name_values[@]} -eq 0 ]; then
        echo "没有找到可用的 tag。"
        exit 1
    fi

    echo "请选择文章的 tag（输入数字选择）："

    select tag in "${folder_name_values[@]}"; do
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
    read -e -p "请输入标题: " title_raw # 使用 -e 选项
    # 清理标题中可能存在的隐藏字符
    title=$(echo "$title_raw" | tr -d '\000-\011\013-\037\177')
    if validate_title "$title"; then
        break
    fi
done

# 保存原始标题（用于文章展示）
original_title="$title"

# 使用sanitize_filename函数处理标题，确保没有不合法字符
formatted_title=$(sanitize_filename "$title")

# 提示用户输入日期，直到输入合法为止或使用当前日期
current_date=$(date '+%Y-%m-%d')
post_date="$current_date" # 默认使用当前日期

while true; do
    read -e -p "请输入文章日期 (YYYY-MM-DD) [按回车使用当前日期 $current_date]: " date_input
    
    # 如果用户直接回车，使用当前日期
    if [ -z "$date_input" ]; then
        break
    fi
    
    if validate_date "$date_input"; then
        post_date="$date_input"
        break
    fi
done

# 从 homepage.json 中获取目录列表
directories=()
while IFS= read -r dir; do
    directories+=("$dir")
done < <(jq -r '.menu[].folder_name' ./_data/homepage.json)

# 提示用户选择目录
echo "请选择目录（输入数字）："
select dir in "${directories[@]}"; do
    if [[ -n $dir ]]; then
        # 直接使用选择的目录名，不进行清理
        selected_dir=$dir
        break
    else
        echo "无效选择，请重新输入"
    fi
done

# 获取 Tag
selectTag # 函数调用

# 不对已选择的tag进行清理，直接使用原始tag
# selected_tag=$(sanitize_filename "$selected_tag")

# 构建新目录路径
new_dir="./posts/$selected_dir/$post_date-$formatted_title"

# 创建文件夹
mkdir -p "$new_dir" || { echo "创建目录失败"; exit 1; }

# 创建 index.md 文件和 assets 文件夹
touch "$new_dir/index.md"
mkdir -p "$new_dir/assets"

# 将标题和其他信息写入 index.md 文件
{
    echo "---"
    echo "title: $original_title" # 使用原始标题（保留空格和允许的特殊字符）
    echo "date: $post_date"
    echo "tags:"
    echo "  - $selected_tag"
    echo "---"
} > "$new_dir/index.md"

# 打印成功信息
echo "文章创建成功！"
echo "文章路径: $new_dir"

# 询问用户是否要撤销创建
read -e -p "是否要撤销创建？(输入 'drop' 撤销，直接回车继续): " discard_choice

# 如果用户输入 drop，则删除创建的目录
if [ "$discard_choice" = "drop" ]; then
    # 确认用户真的想要删除
    read -e -p "确定要删除刚刚创建的文章吗？(y/n): " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        # 删除目录
        rm -rf "$new_dir"
        echo "已删除文章目录: $new_dir"
        exit 0
    else
        echo "取消删除，保留文章"
    fi
fi

# 切换到新创建的目录
cd "$new_dir" || { echo "切换目录失败"; exit 1; }
