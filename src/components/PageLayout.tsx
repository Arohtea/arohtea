import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

export default function PageLayout({ children }: { children: React.ReactNode }) {
    const location = useLocation()
    const pageRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Scroll to top on route change
        window.scrollTo(0, 0)

        // Page entering animation
        const ctx = gsap.context(() => {
            gsap.fromTo(pageRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
            )
        })

        return () => ctx.revert()
    }, [location.pathname])

    return (
        <div ref={pageRef} className="will-change-[opacity,transform]">
            {children}
        </div>
    )
}
