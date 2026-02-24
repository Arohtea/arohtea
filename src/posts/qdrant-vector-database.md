---
title: "Qdrant 向量数据库：AI 应用的记忆中枢"
excerpt: "向量数据库是 RAG、语义搜索和推荐系统的基础设施。Qdrant 是其中最轻量、最易于自托管的选择之一。"
date: "2026-02-05"
category: "Tech"
id: "qdrant-vector-database"
---

# Qdrant 向量数据库：AI 应用的记忆中枢

传统数据库存储的是精确数据：一个 ID，一个名字，一个价格。但文本的"相似度"是模糊的——"苹果手机"和"iPhone"是同一件事，但字符串完全不同。**向量数据库**通过将语义信息编码为高维数字向量，让计算机能够理解这种模糊的相似性。

## 什么是向量（Embedding）？

Embedding 模型（如 OpenAI 的 `text-embedding-ada-002`）会将一段文本转换为一个高维浮点数组，例如 1536 维。

语义相近的文本，它们的向量在高维空间中的距离也更近（余弦相似度更高）。这就是语义搜索和 RAG 的数学基础。

```python
from openai import OpenAI

client = OpenAI()

def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding  # 返回 1536 维向量
```

## Qdrant 快速上手

用 Docker 一键启动：

```bash
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant
```

Python 客户端创建集合并写入数据：

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

client = QdrantClient("localhost", port=6333)

# 创建集合
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
)

# 写入文档
client.upsert(
    collection_name="documents",
    points=[
        PointStruct(
            id=1,
            vector=get_embedding("Spring Cloud 是一个微服务框架"),
            payload={"content": "Spring Cloud 是一个微服务框架", "source": "doc1.pdf"}
        )
    ]
)
```

## 语义搜索

```python
query = "怎么做微服务？"
query_vector = get_embedding(query)

results = client.search(
    collection_name="documents",
    query_vector=query_vector,
    limit=5,  # 返回最相似的 5 条
)

for hit in results:
    print(f"相似度: {hit.score:.3f} | 内容: {hit.payload['content']}")
```

## Qdrant vs. 其他向量数据库

- **Qdrant**：Rust 编写，性能极高，支持过滤查询，自托管友好。
- **Pinecone**：完全托管，开箱即用，但有费用。
- **Chroma**：Python 原生，适合本地快速原型。
- **pgvector**：PostgreSQL 插件，适合已有 PG 基础设施的团队。

对于个人项目或中小型企业，Qdrant 是综合体验最好的选择。
