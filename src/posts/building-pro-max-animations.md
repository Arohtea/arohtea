---
title: "用 GSAP 打造 Pro Max 级别的动画"
excerpt: "深入探索如何使用 GSAP ScrollTrigger 和 Lenis 平滑滚动在 Web 上实现 60fps 动画。"
date: "2026-02-10"
category: "Tech"
id: "building-pro-max-animations"
---

# 用 GSAP 打造 Pro Max 级别的动画

如今的 Web 用户不再满足于静态页面；他们期待的是一种体验。一个用起来「感觉很好」的应用，通常在底层运用了巧妙的物理效果和时序控制。

在这篇文章中，我们将探索两个极其强大的库的结合：**GSAP**（GreenSock 动画平台）和 **Lenis**（一个轻量级平滑滚动库）。

## 为什么选择 GSAP？
CSS 动画对于简单的悬停效果来说足够了，但当你需要由滚动事件触发的编排式、同步化的动画序列时，GSAP 是无可争议的王者。

通过 GSAP 的 `ScrollTrigger`，你可以固定元素、将时间轴直接绑定到滚动条进行擦洗控制，并用一行代码实现元素的交错揭示。

## Lenis 的优势
浏览器原生滚动有时会感觉僵硬或卡顿。Lenis 拦截原生滚动，在将滚动值传递给 UI *之前*对其施加平滑的缓动函数。这创造了一种令人愉悦的、如丝般顺滑的交互体验。

> 将 Lenis 的流畅滚动与 GSAP 的精确触发相结合，你得到的动画不只是发生*在*屏幕上，而是*跟随*用户一起发生。

### 基础配置示例

在 React 18 的严格模式下接入 GSAP 时，我们使用 `gsap.context()` 来方便地进行清理：

```tsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function AnimatedBox() {
    const boxRef = useRef(null)

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo(boxRef.current, 
                { scale: 0 }, 
                { scale: 1, rotation: 360, duration: 1, ease: 'back.out' }
            )
        })

        // 在 React 中清理至关重要！
        return () => ctx.revert()
    }, [])

    return <div ref={boxRef} className="w-32 h-32 bg-white rounded-xl" />
}
```

通过遵循 `useLayoutEffect` 或 `useEffect` + `gsap.context()` 的模式，你可以确保你的「Pro Max」动画不会留下任何内存泄漏。
