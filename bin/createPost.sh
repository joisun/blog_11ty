#! /bin/bash
mkdir ./posts/$(date '+%Y-%m-%d-xxx')
cd ./posts/$(date '+%Y-%m-%d-xxx')/
touch index.md
mkdir assets

echo "---
title: xxx
date: $(date '+%Y-%m-%d')
tags:
  - post
---" > index.md