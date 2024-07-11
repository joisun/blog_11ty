#!/bin/bash

# 验证标题是否合法的函数
validate_title() {
    local title=$1
    if [[ "$title" =~ [[:space:][:punct:]] ]]; then
        echo "标题包含特殊字符或空格，请重新输入。"
        return 1
    fi
}

# 选择tag
selected_tag=""
selectTag() {
    # 让用户选择 tag
    # 声明一个空数组来存储 post_list 字段的值
    post_list_values=()
    # 使用 jq 工具从 homepage.json 中提取 post_list 字段的值
    post_list_values=($(jq -r '.menu[].post_list' ./_data/homepage.json))
    # 打印 post_list 字段的值供用户选择
    echo "请选择文章的 tag（输入数字选择）："

    select tag in ${post_list_values[@]}; do
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
    read -p "请输入标题: " title
    if validate_title "$title"; then
        break
    fi
done

# 获取./post 目录下的子目录列表
directories=$(ls -d ./posts/*/ | cut -d '/' -f 3)

# 提示用户选择目录
echo "请选择目录（输入数字）："
select dir in $directories; do
    if [[ -n $dir ]]; then
        selected_dir=$dir
        break
    else
        echo "无效选择，请重新输入"
    fi
done

# 获取 Tag
selectTag #函数调用


# 创建文件夹和切换到该目录
mkdir "./posts/$selected_dir/$(date '+%Y-%m-%d')-$title"
cd "./posts/$selected_dir/$(date '+%Y-%m-%d')-$title/"

# 创建 index.md 文件并创建 assets 文件夹
touch index.md
mkdir assets

# 将标题和其他信息写入 index.md 文件
echo "---" >index.md
echo "title: $title" >>index.md
echo "date: $(date '+%Y-%m-%d')" >>index.md
echo "tags:" >>index.md
echo "  - $selected_tag" >>index.md
echo "---" >>index.md
