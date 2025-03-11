---
title: Docker Tips
date: 2023-11-15
tags:
  - Docker
  - DevOps
  - Cheat_Sheet
  - 容器化
  - CLI
---


| 命令                                     | 作用                                     |      |
| ---------------------------------------- | ---------------------------------------- | ---- |
| docker ps                                | 列出正在运行中的容器                     |      |
| docker ps -a                             | 列出所有容器                             |      |
| docker images                            | 列出所有本地镜像                         |      |
| docker rm [container1, ... , containerN] | 删除一个或者多个容器                     |      |
| docker rmi [img1, ... ,imgN]             | 删除一个或者多个镜像                     |      |
| docker container prune                   | 删除所有未被占用的(未运行的)容器         |      |
| docker image prune                       | 删除所有未被占用的(未运行的)镜像         |      |
| docker run/stop                          | 创建并启动某个容器/ 停止一个或者多个容器 |      |
| docker pull/push                         | 镜像拉取/推送到远程仓库                  |      |
| docker network ls                        | 列出所有 Docker 网络                     |      |
| docker volume ls                         | 列出所有 Docker 数据卷                   |      |
| docker stop $(docker ps -aq)             | **停止所有运行中的容器**                 |      |
| docker rm $(docker ps -aq)               | **移除所有容器**                         |      |
| docker rmi $(docker images -q)           | **移除所有镜像**                         |      |
| docker system prune -a --volumes         | **清理未使用的资源**                     |      |

> ​	更多docker 相关指令见： https://docs.docker.com/reference/cli/docker/

| 命令                                               | 作用                                                         |      |
| -------------------------------------------------- | ------------------------------------------------------------ | ---- |
| docker-compose up                                  | 启动当前目录下的 docker-compose.yml 脚本                     |      |
| docker-compose up -d                               | 后台启动                                                     |      |
| docker-compose down                                | 停止并移除脚本中的容器、网络、卷和镜像。                     |      |
| docker-compose exec -it <container_name> /bin/bash | 打开某个正在运行中的容器的shell窗口                          |      |
| docker-compose logs <container_name>               | 打印某个运行中的容器的日志                                   |      |
| docker-compose logs -f <container_name>            | 实时监听某个运行中容器日志                                   |      |
| docker-compose ps                                  | 列出在docker-compose.yml 中定义的服务                        |      |
| docker-compose build                               | 使用 `Dockerfile` 或 `docker-compose.yml` 中的构建上下文重新构建服务 |      |
| docker-compose stop                                | 停止服务中的所有容器                                         |      |
| docker-compose restart                             | 重启服务中的所有容器                                         |      |
| docker-compose rm                                  | 移除停止的容器                                               |      |

> 更多docker-compose 相关指令见：https://docs.docker.com/compose/reference/

Dockerfile 文档：https://docs.docker.com/reference/dockerfile/

Docker Compose File 文档： https://docs.docker.com/compose/compose-file/