---
title: "Docker Compose 一键部署全栈应用"
excerpt: "告别「在我机器上跑得好好的」的困境。用 Docker Compose 将你的前后端、数据库全部容器化，一条命令启动整个系统。"
date: "2026-02-08"
category: "Tech"
id: "docker-compose-deploy"
---

# Docker Compose 一键部署全栈应用

每个开发者都经历过这个噩梦：在本地工作完美，部署到服务器后各种报错。环境差异—— JDK 版本、配置文件路径、数据库端口——是大多数"玄学 BUG"的真正元凶。**Docker** 从根源上解决了这个问题。

## 为什么是 Docker Compose？

单个 `docker run` 命令已经很好了，但真实的全栈应用通常有多个服务：

- Spring Boot 后端
- Vue 3 前端（Nginx 托管）
- PostgreSQL 数据库
- Redis 缓存

`docker-compose.yml` 让你用一个文件声明所有服务，用一条命令统一管理它们的生命周期。

## 一个真实的配置示例

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/myapp
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  pgdata:
```

## 环境变量与 `.env` 文件

敏感信息（密码、密钥）绝对不应该硬编码在 `docker-compose.yml` 里。使用 `.env` 文件，并将其加入 `.gitignore`。

```
# .env
DB_PASSWORD=super_secret_password_123
```

## 常用命令速查

```bash
# 后台启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f backend

# 停止并删除容器（保留数据卷）
docker compose down

# 停止并删除容器+数据卷（彻底清空）
docker compose down -v
```

一次配置，处处运行。这就是容器化的魅力。
