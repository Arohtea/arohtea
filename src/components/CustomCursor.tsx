import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useUIStore } from '../store/useUIStore'
import { useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const cursorDotRef = useRef<HTMLDivElement>(null)
    const { cursorType } = useUIStore()
    const location = useLocation()

    useEffect(() => {
        let ctx = gsap.context(() => {
            const cursor = cursorRef.current
            const dot = cursorDotRef.current
            if (!cursor || !dot) return

            gsap.set([cursor, dot], { xPercent: -50, yPercent: -50 })

            const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' })
            const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' })
            const dotXTo = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'power3' })
            const dotYTo = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'power3' })

            const onMouseMove = (e: MouseEvent) => {
                xTo(e.clientX)
                yTo(e.clientY)
                dotXTo(e.clientX)
                dotYTo(e.clientY)
            }

            window.addEventListener('mousemove', onMouseMove)

            // Add pointer events logic globally (automatic hover state without wrapping everything)
            const handleMouseOver = (e: MouseEvent) => {
                const target = e.target as HTMLElement
                if (
                    target.tagName.toLowerCase() === 'a' ||
                    target.tagName.toLowerCase() === 'button' ||
                    target.closest('a') ||
                    target.closest('button') ||
                    target.classList.contains('cursor-pointer')
                ) {
                    useUIStore.getState().setCursorType('hover')
                } else if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || window.getSelection()?.toString() !== '') {
                    useUIStore.getState().setCursorType('text')
                } else {
                    useUIStore.getState().setCursorType('default')
                }
            }

            const handleMouseLeave = () => {
                useUIStore.getState().setCursorType('hidden')
            }

            const handleMouseEnter = () => {
                useUIStore.getState().setCursorType('default')
            }

            window.addEventListener('mouseover', handleMouseOver)
            document.documentElement.addEventListener('mouseleave', handleMouseLeave)
            document.documentElement.addEventListener('mouseenter', handleMouseEnter)

            // Cleanup inside context
            return () => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseover', handleMouseOver)
                document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
                document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
            }
        })

        return () => ctx.revert()
    }, [location.pathname]) // re-bind occasionally on route change if needed

    // Animation for state changes
    useEffect(() => {
        const cursor = cursorRef.current
        if (!cursor) return

        if (cursorType === 'hover') {
            gsap.to(cursor, { scale: 1.5, opacity: 0.5, duration: 0.3, ease: 'expo.out' })
        } else if (cursorType === 'text') {
            gsap.to(cursor, { scale: 0.5, opacity: 0.8, borderRadius: '4px', width: '4px', height: '24px', duration: 0.3, ease: 'expo.out' })
        } else if (cursorType === 'hidden') {
            gsap.to(cursor, { opacity: 0, duration: 0.3 })
            gsap.to(cursorDotRef.current, { opacity: 0, duration: 0.3 })
        } else {
            gsap.to(cursor, { scale: 1, opacity: 1, borderRadius: '50%', width: '32px', height: '32px', duration: 0.3, ease: 'expo.out' })
            gsap.to(cursorDotRef.current, { opacity: 1, duration: 0.3 })
        }
    }, [cursorType])

    return (
        <>
            <div
                ref={cursorRef}
                className={clsx(
                    "fixed top-0 left-0 w-8 h-8 rounded-full border border-zinc-500 pointer-events-none z-[100] mix-blend-difference hidden md:block",
                )}
            />
            <div
                ref={cursorDotRef}
                className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[100] mix-blend-difference hidden md:block"
            />
        </>
    )
}
