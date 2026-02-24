---
title: "GSAP 进阶：Timeline、ScrollTrigger 与 Observer 实战"
excerpt: "CSS 动画做不到的事，GSAP 可以。从基础的 Timeline 到全屏滚动接管，一篇文章带你掌握 GSAP 的精髓。"
date: "2026-02-18"
category: "Tech"
id: "gsap-advanced-animations"
---

# GSAP 进阶：Timeline、ScrollTrigger 与 Observer 实战

CSS `transition` 和 `animation` 足以应付 80% 的动效需求。但当你需要**精确控制时间轴**、**基于滚动触发动画序列**、或者**完全接管页面的滚动行为**时，GSAP 是无可替代的工具。

## Timeline：动画的指挥棒

单独的 `gsap.to()` 只能控制一个动画。`Timeline` 让你将多个动画串联成一首交响乐：

```typescript
import gsap from 'gsap'

const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

tl.from('.hero-title', { y: 60, opacity: 0, duration: 1 })
  .from('.hero-subtitle', { y: 40, opacity: 0, duration: 0.8 }, '-=0.4') // 提前 0.4s 开始
  .from('.hero-cta', { scale: 0.8, opacity: 0, duration: 0.6 }, '-=0.3')
  .from('.hero-image', { x: 100, opacity: 0, duration: 1.2 }, '<') // 与上一个同时开始
```

位置参数（`'-=0.4'`、`'<'`）让时间轴的精细控制变得直观。

## ScrollTrigger：让滚动驱动动画

```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

gsap.from('.card', {
    y: 80,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
        trigger: '.cards-section',
        start: 'top 80%', // 元素顶部进入视口 80% 处时触发
        end: 'bottom 20%',
        toggleActions: 'play none none reverse', // 进入/离开/重进/再离开
    }
})
```

## Observer：完全接管滚动

这是这个博客本身使用的技术。`Observer` 监听所有输入事件（滚轮、触摸、键盘），让你用 JavaScript 完全控制页面如何响应「滚动意图」：

```typescript
import { Observer } from 'gsap/Observer'
gsap.registerPlugin(Observer)

Observer.create({
    type: 'wheel,touch,pointer',
    wheelSpeed: -1,
    onUp: () => goToNextSection(),
    onDown: () => goToPrevSection(),
    tolerance: 10,        // 最小位移阈值，防抖
    preventDefault: true, // 禁止原生滚动
})
```

## 性能最佳实践

1. **只动 `transform` 和 `opacity`**：这两个属性在 GPU 上处理，不触发重排（reflow）。
2. **`will-change: transform`**：提前告知浏览器这个元素会被动画，让它预先提升为合成层。
3. **`gsap.context()` 用于 React/Vue**：配合框架的生命周期，避免内存泄漏。

```typescript
useEffect(() => {
    const ctx = gsap.context(() => {
        // 所有 GSAP 动画写在这里
    }, rootRef)

    return () => ctx.revert() // 组件卸载时自动清理
}, [])
```

GSAP 是我使用过的最有"工程美感"的前端库，它的 API 设计堪称艺术品。
