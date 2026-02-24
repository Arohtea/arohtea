import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile, skills } from '../../data'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
    const paragraphRef = useRef<HTMLDivElement>(null)
    const hasPlayed = useRef(false)
    const [typedText, setTypedText] = useState('')
    const typingDone = useRef(false)
    const typewriterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const fullText = `system.initialize('${profile.headline}');`

    const startTypewriter = useCallback(() => {
        let i = 0
        setTypedText('')
        const interval = setInterval(() => {
            i++
            setTypedText(fullText.slice(0, i))
            if (i >= fullText.length) {
                clearInterval(interval)
                typingDone.current = true
            }
        }, 2000 / fullText.length)
        return interval
    }, [fullText])

    useEffect(() => {
        // Restore full text if typing was already completed (handles re-render)
        if (typingDone.current && !typedText) {
            setTypedText(fullText)
        }

        // Hide everything initially — only before first play
        if (!hasPlayed.current) {
            if (paragraphRef.current) {
                gsap.set(paragraphRef.current.children, { opacity: 0, y: 20 })
            }
            gsap.set(['.skills-title', '.skills-subtitle'], { opacity: 0, y: 50 })
            gsap.set('.skill-list-item', { opacity: 0, y: 20 })
        }

        const handleSlideChanged = (e: CustomEvent) => {
            if (e.detail.index === 1 && !hasPlayed.current) {
                hasPlayed.current = true

                // Lock scroll during intro animation
                window.isSlideAnimationLocked = true
                if (window.scrollObserver) window.scrollObserver.disable()

                // Typewriter via React state
                typewriterIntervalRef.current = startTypewriter()

                // Fade in Content
                if (paragraphRef.current) {
                    gsap.to(paragraphRef.current.children, {
                        opacity: 1, y: 0,
                        duration: 1, stagger: 0.2,
                        ease: 'power3.out', delay: 2.3
                    })
                }

                gsap.to(['.skills-title', '.skills-subtitle'], {
                    y: 0, opacity: 1,
                    duration: 1, stagger: 0.2,
                    ease: 'power3.out', delay: 2.6
                })

                gsap.to('.skill-list-item', {
                    y: 0, opacity: 1,
                    duration: 0.6, stagger: 0.02,
                    ease: 'power2.out', delay: 3.0,
                    onComplete: () => {
                        // All animations done — unlock scroll
                        window.isSlideAnimationLocked = false
                        if (window.scrollObserver) window.scrollObserver.enable()
                    }
                })
            } else if (e.detail.index !== 1 && hasPlayed.current) {
                // Leaving About slide — complete everything immediately
                if (typewriterIntervalRef.current) {
                    clearInterval(typewriterIntervalRef.current)
                    typewriterIntervalRef.current = null
                }
                if (!typingDone.current) {
                    typingDone.current = true
                    setTypedText(fullText)
                }
                // Kill any pending GSAP tweens then force visible
                if (paragraphRef.current) {
                    gsap.killTweensOf(paragraphRef.current.children)
                    gsap.set(paragraphRef.current.children, { opacity: 1, y: 0 })
                }
                gsap.killTweensOf(['.skills-title', '.skills-subtitle'])
                gsap.set(['.skills-title', '.skills-subtitle'], { opacity: 1, y: 0 })
                gsap.killTweensOf('.skill-list-item')
                gsap.set('.skill-list-item', { opacity: 1, y: 0 })
            } else if (e.detail.index === 1 && hasPlayed.current) {
                // Returning to About after already played — ensure everything visible
                if (paragraphRef.current) {
                    gsap.set(paragraphRef.current.children, { opacity: 1, y: 0 })
                }
                gsap.set(['.skills-title', '.skills-subtitle'], { opacity: 1, y: 0 })
                gsap.set('.skill-list-item', { opacity: 1, y: 0 })
            }
        }

        window.addEventListener('slideChanged', handleSlideChanged as EventListener)
        return () => {
            window.removeEventListener('slideChanged', handleSlideChanged as EventListener)
            if (typewriterIntervalRef.current) {
                clearInterval(typewriterIntervalRef.current)
                typewriterIntervalRef.current = null
            }
        }
    }, [startTypewriter])

    return (
        <div className="h-screen pt-20 md:pt-28 pb-6 md:pb-10 px-4 md:px-12 max-w-6xl mx-auto flex flex-col overflow-hidden">
            <div className="py-2 font-mono text-sm md:text-base text-zinc-500 mb-4 md:mb-8 h-6 flex items-center border-l-2 border-zinc-700 pl-4 shrink-0">
                <span>&gt; </span>
                <span className="ml-2 text-white">{typedText}</span>
                <span className="w-2 h-5 bg-white ml-1 animate-blink" />
            </div>

            <div ref={paragraphRef} className="space-y-4 md:space-y-8 text-zinc-300 flex-1 min-h-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {/* Profile Summary */}
                <div
                    className="font-serif text-lg md:text-3xl leading-relaxed prose prose-invert prose-p:my-0 lg:prose-p:leading-snug prose-p:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: profile.summary }}
                />

                {/* Skills Section */}
                <div className="pt-3 md:pt-6 border-t border-white/10">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-3 md:mb-6 px-4">
                        <h2 className="skills-title text-3xl md:text-5xl lg:text-7xl font-black font-serif uppercase tracking-tighter leading-none text-white">
                            <span>技术栈</span>
                        </h2>
                        <p className="skills-subtitle text-base md:text-xl font-medium max-w-sm text-left md:text-right mt-4 md:mt-0 text-zinc-300">
                            助力创造的精选工具与技术。
                        </p>
                    </div>

                    {/* Category Lists */}
                    <div className="skill-list-container grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 mt-4 md:mt-6 px-4">
                        {skills.map((cat, idx) => (
                            <div key={idx} className="border-t border-white/20 pt-4">
                                <h3 className="text-sm md:text-lg font-bold uppercase mb-2 md:mb-3 text-white tracking-widest">
                                    {cat.name}
                                </h3>
                                <ul className="space-y-0.5 md:space-y-1.5">
                                    {cat.keywords.map((item) => (
                                        <li key={item} className="skill-list-item text-xs md:text-base font-medium text-zinc-300 hover:text-white transition-colors">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
