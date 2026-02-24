---
title: "从零搭建 Spring Cloud 微服务架构"
excerpt: "一步步拆解微服务架构的核心组件：Gateway、Nacos、OpenFeign，以及如何让它们协同工作。"
date: "2026-02-10"
category: "Tech"
id: "spring-cloud-microservices"
---

# 从零搭建 Spring Cloud 微服务架构

单体应用在早期非常高效。但随着系统规模增长，一次小小的发布可能让整个服务重启，一个模块的崩溃会拖垮整个平台。**微服务架构**正是为此而生的解法。

## 核心三角：Gateway + Nacos + OpenFeign

一套 Spring Cloud 微服务体系，本质上是三个核心问题的解答：

- **如何对外暴露服务？** → Spring Cloud Gateway（API 网关）
- **各微服务之间如何发现彼此？** → Nacos（服务注册与发现）
- **服务间如何调用？** → OpenFeign（声明式 HTTP 客户端）

## Gateway：统一入口

Gateway 是整个系统的"大门"。所有外部请求都先经过它，由它根据路由规则分发到对应的微服务。

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=2
```

注意 `uri: lb://user-service` 中的 `lb://` 前缀，这表示使用负载均衡方式调用注册在 Nacos 上的 `user-service`。

## Nacos：服务的户籍系统

每个微服务启动后都会向 Nacos 注册自己，并持续发送心跳证明自己还活着。任何服务想要调用另一个服务时，只需向 Nacos 询问"这个名字叫什么的服务现在在哪里？"

```yaml
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: 127.0.0.1:8848
```

## OpenFeign：像调本地方法一样调远程服务

有了 Nacos 的服务发现，OpenFeign 可以让你以接口的形式调用远程服务，完全屏蔽 HTTP 的底层细节。

```java
@FeignClient(name = "user-service")
public interface UserClient {
    @GetMapping("/api/user/{id}")
    UserDTO getUserById(@PathVariable Long id);
}
```

## 结语

微服务架构不是银弹，它引入了网络延迟、分布式事务等新问题。但对于真正需要高并发、独立扩缩容的系统来说，这套架构是值得投入的。
