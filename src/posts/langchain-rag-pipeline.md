---
title: "用 LangChain 构建 RAG 文档分析流水线"
excerpt: "从理论到实践：如何利用检索增强生成（RAG）技术让大语言模型真正「读懂」你的私有文档。"
date: "2026-02-12"
category: "Tech"
id: "langchain-rag-pipeline"
---

# 用 LangChain 构建 RAG 文档分析流水线

大语言模型（LLM）知识固化在训练截止日期之前。如果你想让它分析你的私有文档、内部知识库或实时数据，**RAG（检索增强生成）** 是目前最成熟的解决方案。

## RAG 的核心思想

RAG 的逻辑非常直观：

1. **离线向量化**：将文档切片、嵌入成向量，存入向量数据库（如 Qdrant）。
2. **在线检索**：用户提问时，先把问题也嵌入向量，在数据库中找相关片段。
3. **增强生成**：把检索到的上下文拼接进 Prompt，让 LLM 基于这些内容作答。

这样 LLM 本身无需知道你的文档内容，只需要具备「阅读理解和归纳」的能力。

## LangChain 实现

```python
from langchain_community.vectorstores import Qdrant
from langchain.chains import RetrievalQA
from langchain_openai import OpenAIEmbeddings, ChatOpenAI

# 1. 加载向量存储
vectorstore = Qdrant.from_existing_collection(
    embedding=OpenAIEmbeddings(),
    collection_name="my_docs",
    url="http://localhost:6333",
)

# 2. 构建 RAG 链
qa_chain = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-4o"),
    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
    chain_type="stuff",
)

# 3. 提问
result = qa_chain.invoke("这份报告的核心结论是什么？")
print(result["result"])
```

## MAP-REDUCE：处理超长文档

对于超过上下文窗口的长文档，可以使用 `map_reduce` 策略：先对每个文档片段单独总结（Map），再将所有摘要汇总生成最终结论（Reduce）。

```python
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    chain_type="map_reduce",  # 关键改动
)
```

## 关键指标：召回率 vs. 精确率

RAG 的效果很大程度上取决于检索质量。召回率太低会漏掉关键信息；精确率太低会引入噪声。可以通过调整 `k` 值（检索数量）和 chunk 大小来平衡。

> 一个好的 RAG 系统，80% 的工作在于数据处理和 Embedding 优化，20% 才是 Prompt 调教。
