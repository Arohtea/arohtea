---
title: "Vue 3 Composition API：从 Options API 到响应式新思维"
excerpt: "Composition API 不只是语法糖。它重新定义了 Vue 组件的逻辑组织方式，让复杂业务逻辑真正可复用、可测试。"
date: "2026-01-15"
category: "Tech"
id: "vue3-composition-api"
---

# Vue 3 Composition API：从 Options API 到响应式新思维

很多从 Vue 2 迁移过来的开发者对 Composition API 的第一感受是：*这不就是把代码变得更长了吗？* 其实不然。Composition API 根本性的改变是**逻辑的组织方式**，而不只是写法。

## Options API 的痛点

在 Vue 2 的 Options API 中，代码按类型分组：`data`、`computed`、`methods`、`watch`……

当组件逻辑变复杂时，**同一个功能的相关代码被分散在文件的各个角落**。你要理解一个功能，需要在 `data` 里找状态、在 `computed` 里找派生值、在 `methods` 里找处理函数，跳来跳去。

## Composition API：按关注点分组

```typescript
// useCounter.ts - 一个可复用的计数器逻辑
import { ref, computed } from 'vue'

export function useCounter(initial = 0) {
    const count = ref(initial)
    const doubled = computed(() => count.value * 2)

    function increment() { count.value++ }
    function reset() { count.value = initial }

    return { count, doubled, increment, reset }
}
```

```vue
<script setup lang="ts">
// 组件只需引入，逻辑完全封装在外部
import { useCounter } from './useCounter'

const { count, doubled, increment } = useCounter(10)
</script>
```

这就是 Composable（组合式函数）模式：**把相关联的状态和逻辑封装在一起，像插件一样插入任何组件**。

## `ref` vs `reactive`：如何选择

- **`ref`**：适合基本类型（`string`、`number`、`boolean`），访问时需要 `.value`。
- **`reactive`**：适合对象，内部属性可直接访问，但解构后会失去响应性。

```typescript
const count = ref(0) // 需要 count.value
const state = reactive({ count: 0, name: '' }) // 直接 state.count
```

经验法则：**优先用 `ref`**，它行为更一致，在模板中自动解包（不需要 .value）。

## `script setup` 语法糖

`script setup` 是 Vue 3.2 引入的编译时语法糖。所有在顶层声明的变量和函数自动暴露给模板，无需 `return`，代码量减少 30%。

```vue
<script setup lang="ts">
const message = ref('Hello Vue 3') // 模板直接可用
</script>

<template>
  <p>{{ message }}</p>
</template>
```

Composition API + `script setup` + TypeScript，是目前 Vue 3 开发的最佳实践组合。
