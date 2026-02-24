---
title: "RabbitMQ 异步任务：让你的系统真正「解耦」"
excerpt: "当一个 HTTP 请求需要等待 AI 分析、发邮件、发短信……结果就是超时。用消息队列把它们全部异步化。"
date: "2026-01-28"
category: "Tech"
id: "rabbitmq-async-tasks"
---

# RabbitMQ 异步任务：让你的系统真正「解耦」

你有没有见过这样的接口：`POST /api/analyze`，一调用就转圈转 30 秒？这是糟糕的系统设计。用户不应该等待耗时操作——他们只需要得到一个"我收到了，处理完通知你"的承诺。**消息队列**让你做到这一点。

## 核心模型：生产者 与 消费者

```
用户请求 → 生产者（API层）→ 消息队列（RabbitMQ）→ 消费者（Worker）→ 结果通知（SSE/WebSocket）
```

用户发起请求后，Producer 立即将任务消息丢进队列并返回 `202 Accepted`。Worker 在后台独立消费任务，完成后通过 SSE 将结果推送给用户。

## Spring Boot 集成

```java
// 生产者：立即返回，任务入队
@RestController
public class AnalyzeController {
    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping("/api/analyze")
    public ResponseEntity<String> startAnalysis(@RequestBody AnalysisRequest req) {
        String taskId = UUID.randomUUID().toString();
        rabbitTemplate.convertAndSend("analysis.queue", new AnalysisTask(taskId, req));
        return ResponseEntity.accepted().body(taskId); // 立即返回 202
    }
}

// 消费者：异步处理
@RabbitListener(queues = "analysis.queue")
@Component
public class AnalysisWorker {
    public void process(AnalysisTask task) {
        // 耗时操作：调用 AI、写数据库...
        String result = aiService.analyze(task.getContent());
        sseService.push(task.getTaskId(), result);
    }
}
```

## 消息的可靠性保障

不是所有消息都能成功处理，Worker 崩溃或 AI 接口超时都可能让消息丢失。RabbitMQ 提供两种机制应对：

- **持久化（Durable）**：将队列和消息都标记为持久化，重启后不丢失。
- **手动 ACK**：消费者处理成功后再确认，失败则重回队列。

```java
@RabbitListener(queues = "analysis.queue", ackMode = "MANUAL")
public void process(AnalysisTask task, Channel channel, @Header long deliveryTag) {
    try {
        doWork(task);
        channel.basicAck(deliveryTag, false); // 成功确认
    } catch (Exception e) {
        channel.basicNack(deliveryTag, false, true); // 失败，重新入队
    }
}
```

## 结语

消息队列是构建高并发、高可用系统必备的一块拼图。它不只是解决超时问题，更是真正实现服务解耦的关键手段。
