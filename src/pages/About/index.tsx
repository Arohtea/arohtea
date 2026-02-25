import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile, skills, experience, education } from '../../data'

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
        <div className="h-screen pt-28 md:pt-36 pb-6 md:pb-10 px-4 md:px-12 max-w-6xl mx-auto flex flex-col overflow-hidden">
            <div className="py-2 font-mono text-sm md:text-base text-zinc-500 mb-4 md:mb-8 h-6 flex items-center border-l-2 border-zinc-700 pl-4 shrink-0">
                <span>&gt; </span>
                <span className="ml-2 text-white">{typedText}</span>
                <span className="w-2 h-5 bg-white ml-1 animate-blink" />
            </div>

            <div ref={paragraphRef} className="space-y-4 md:space-y-8 text-zinc-300 flex-1 min-h-0 overflow-hidden">
                {/* Profile Summary */}
                <div
                    className="font-serif text-lg md:text-3xl leading-relaxed prose prose-invert prose-p:my-0 lg:prose-p:leading-snug prose-p:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: profile.summary }}
                />

                {/* Skills Section */}
                <div className="pt-5 md:pt-8 border-t border-white/10">
                    <div className="flex items-baseline justify-between mb-4 md:mb-14 md:mt-2">
                        <h2 className="skills-title text-2xl md:text-4xl lg:text-5xl font-black font-serif uppercase tracking-tighter leading-none text-white">
                            技术栈
                        </h2>
                        <p className="skills-subtitle text-xs md:text-sm text-zinc-500 font-medium">
                            助力创造的精选工具与技术
                        </p>
                    </div>

                    {/* Mobile: compact row layout */}
                    <div className="skill-list-container md:hidden space-y-2.5">
                        {skills.map((cat, idx) => (
                            <div key={idx} className="flex items-baseline gap-3">
                                <span className="skill-list-item text-[11px] font-bold uppercase text-white/70 tracking-widest whitespace-nowrap shrink-0 w-16">
                                    {cat.name}
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {cat.keywords.map((item) => (
                                        <span key={item} className="skill-list-item text-[11px] text-zinc-400 border border-white/10 rounded px-1.5 py-0.5 hover:text-white hover:border-white/30 transition-colors">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: grid layout */}
                    <div className="skill-list-container hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-6 px-4">
                        {skills.map((cat, idx) => (
                            <div key={idx} className="border-t border-white/20 pt-4">
                                <h3 className="text-lg font-bold uppercase mb-3 text-white tracking-widest">
                                    {cat.name}
                                </h3>
                                <ul className="space-y-1.5">
                                    {cat.keywords.map((item) => (
                                        <li key={item} className="skill-list-item text-base font-medium text-zinc-300 hover:text-white transition-colors">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Experience & Education Strip */}
                <div className="pt-4 md:pt-6 border-t border-white/10">
                    <p className="skill-list-item text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/40 mb-2.5 md:mb-3">履历</p>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                        {experience.map((exp) => (
                            <div key={exp.id} className="skill-list-item group flex items-center gap-2.5 border border-white/10 rounded-lg px-3 py-2 md:px-4 md:py-2.5 hover:border-white/25 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-white/80 text-xs md:text-sm font-medium leading-tight">{exp.company}</span>
                                    <span className="text-zinc-500 text-[10px] md:text-xs leading-tight">{exp.position}</span>
                                </div>
                            </div>
                        ))}
                        {education.map((edu) => (
                            <div key={edu.id} className="skill-list-item group flex items-center gap-2.5 border border-white/10 rounded-lg px-3 py-2 md:px-4 md:py-2.5 hover:border-white/25 transition-colors">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-colors shrink-0" />
                                <div className="flex flex-col">
                                    <span className="text-white/80 text-xs md:text-sm font-medium leading-tight">{edu.school}</span>
                                    <span className="text-zinc-500 text-[10px] md:text-xs leading-tight">{edu.area} · {edu.degree}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
