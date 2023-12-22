#!/bin/bash

# 获取当前目录
current_dir=$(pwd)

# 遍历当前目录下的一级子目录和文件
for item in "$current_dir"/*; do
  # 检查是否为目录或文件
  if [ -d "$item" ] || [ -f "$item" ]; then
    # 获取最后修改时间
    last_modified=$(stat -c %Y "$item")

    # 将最后修改时间格式化为前缀
    prefix=$(date -d "@$last_modified" +"%Y-%m-%d")

    # 新的文件名或目录名
    new_name="${prefix}-$(basename "$item")"

    # 重命名
    mv "$item" "$current_dir/$new_name"

    echo "Renamed: $item -> $new_name"
  fi
done

echo "Renaming complete."

