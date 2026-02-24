---
title: "SSE 实现 AI 流式输出：像 ChatGPT 一样逐字推送"
excerpt: "Server-Sent Events（SSE）是实现 AI 流式推送的最优雅方案。比 WebSocket 轻量，比轮询高效，和 API 网关天然兼容。"
date: "2026-01-25"
category: "Tech"
id: "sse-realtime-streaming"
---

# SSE 实现 AI 流式输出：像 ChatGPT 一样逐字推送

当你第一次看到 ChatGPT 的文字一个个"打印"出来，而不是等待 10 秒统一返回，你有没有想过这是怎么实现的？答案就是 **SSE（Server-Sent Events）**，一个古老却非常适合这个场景的 Web 标准。

## 为什么不用 WebSocket？

WebSocket 是双向实时通信的首选，但对于 **AI 流式输出**这个场景，它有点"大材小用"：

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| 方向 | 双向 | 单向（服务端 → 客户端）|
| 协议 | 独立协议（ws://） | 基于 HTTP |
| 代理/CDN 兼容 | 复杂 | 开箱即用 |
| 实现难度 | 较高 | 极简 |

AI 流式输出是典型的**单向推送**场景，SSE 更合适。

## Spring Boot 后端实现

```java
@GetMapping(value = "/api/analyze/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ServerSentEvent<String>> streamAnalysis(@RequestParam String taskId) {
    return Flux.create(sink -> {
        // 监听任务进度，逐步推送
        aiService.streamAnalysis(taskId, token -> {
            sink.next(ServerSentEvent.builder(token)
                .event("token")
                .build());
        }, () -> {
            sink.next(ServerSentEvent.builder("[DONE]").event("done").build());
            sink.complete();
        });
    });
}
```

## Vue 3 前端接收

```typescript
const startStreaming = (taskId: string) => {
    const eventSource = new EventSource(`/api/analyze/stream?taskId=${taskId}`)
    let buffer = ''

    eventSource.addEventListener('token', (event) => {
        buffer += event.data
        displayText.value = buffer // 响应式更新，自动渲染
    })

    eventSource.addEventListener('done', () => {
        eventSource.close()
        isLoading.value = false
    })

    eventSource.onerror = () => {
        eventSource.close()
        showError('流式连接中断')
    }
}
```

## 与 RabbitMQ 结合：异步 + 流式

在真实的 AI 分析系统中，我们通常将两者结合：

1. 用户请求 → API 返回 `taskId`，任务进入 **RabbitMQ** 队列
2. Worker 消费任务，调用 AI 接口，将 token 逐步写入 Redis Stream
3. SSE 接口订阅 Redis Stream，将数据实时推送给用户

这样即使用户连接中断，任务仍在后台继续处理，重连后可以续接进度。
