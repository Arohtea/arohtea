import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects } from '../../data'

import bridgeMonitor from '../../assets/images/bridge-monitor.png'
import ojPlatform from '../../assets/images/oj-platform.png'
import codeRefactor from '../../assets/images/code-refactor.png'
import bleDebug from '../../assets/images/ble-debug.png'
import harmonyMigration from '../../assets/images/harmony-migration.png'
import wechatMini from '../../assets/images/wechat-mini.png'
import dehydrator from '../../assets/images/Dehydrator.png'

const projectImages: Record<string, string> = {
    proj0: bridgeMonitor,
    proj1: ojPlatform,
    proj2: codeRefactor,
    proj3: bleDebug,
    proj4: dehydrator,
    proj5: harmonyMigration,
    proj6: wechatMini,
}

gsap.registerPlugin(ScrollTrigger)

export default function Projects() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const wrapperRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLHeadingElement>(null)
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const descPanelRef = useRef<HTMLDivElement>(null)
    const currentIndexRef = useRef(0);
    const animating = useRef(false);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Calculate the x offset needed to center a card by index
    const getCenterOffset = (index: number) => {
        const card = cardRefs.current[index];
        const wrapper = wrapperRef.current;
        if (!card || !wrapper) return 0;

        const currentX = gsap.getProperty(wrapper, "x") as number || 0;
        const cardRect = card.getBoundingClientRect();

        // Card's natural center (when wrapper x = 0)
        const cardNaturalCenter = cardRect.left - currentX + cardRect.width / 2;
        const screenCenter = window.innerWidth / 2;

        return screenCenter - cardNaturalCenter;
    };

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Initial render state: hide everything
            gsap.set(headerRef.current, { opacity: 0, x: -50 });
            gsap.set(wrapperRef.current, { opacity: 0 });
            gsap.set(descPanelRef.current, { opacity: 0, y: 20 });
            cardRefs.current.forEach((card) => {
                if (card) gsap.set(card, { scale: 0.9, opacity: 0 });
            });
        });

        // Listen for when Home slides to us
        const handleSlideChanged = (e: CustomEvent) => {
            if (e.detail.index === 2) {
                // Lock scroll during intro animation
                window.isSlideAnimationLocked = true
                if (window.scrollObserver) window.scrollObserver.disable()

                // Pre-center before revealing
                gsap.set(wrapperRef.current, { x: getCenterOffset(currentIndexRef.current) });

                // Fade in wrapper
                gsap.to(wrapperRef.current, {
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.3
                });

                // Fade in description panel
                gsap.to(descPanelRef.current, {
                    opacity: 1, y: 0,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: 0.7,
                    onComplete: () => {
                        // Intro done — unlock scroll
                        window.isSlideAnimationLocked = false
                        if (window.scrollObserver) window.scrollObserver.enable()
                    }
                });

                // Showcase header
                gsap.to(headerRef.current, {
                    opacity: 1, x: 0,
                    duration: 1,
                    ease: 'power3.out',
                    delay: 0.2
                });

                if (window.scrollObserver) {
                    window.isProjectsHorizontalScrolling = true;
                }

                // Scale active card up, others stay small
                cardRefs.current.forEach((card, idx) => {
                    if (card) {
                        const isActive = idx === currentIndexRef.current;
                        gsap.to(card, {
                            scale: isActive ? 1.1 : 0.9,
                            opacity: isActive ? 1 : 0.5,
                            duration: 0.6,
                            ease: "power2.out",
                            delay: 0.5
                        });
                    }
                });
            } else {
                // Leaving Projects
                gsap.to(headerRef.current, { opacity: 0, x: -50, duration: 0.5 });
                gsap.to(wrapperRef.current, { opacity: 0, duration: 0.4 });
                gsap.to(descPanelRef.current, { opacity: 0, y: 20, duration: 0.4 });
                window.isProjectsHorizontalScrolling = false;
            }
        };

        window.addEventListener('slideChanged', handleSlideChanged as EventListener);

        // 通用导航函数：direction 1=下一个, -1=上一个
        const navigateCard = (direction: number) => {
            if (animating.current || !wrapperRef.current) return;
            animating.current = true;
            const nextIndex = currentIndexRef.current + direction;

            if (nextIndex < 0) {
                window.isProjectsHorizontalScrolling = false;
                if (window.gotoSlide) window.gotoSlide(1, -1);
                setTimeout(() => { animating.current = false; }, 800);
                return;
            }
            if (nextIndex > projects.length - 1) {
                window.isProjectsHorizontalScrolling = false;
                if (window.gotoSlide) window.gotoSlide(3, 1);
                setTimeout(() => { animating.current = false; }, 800);
                return;
            }

            currentIndexRef.current = nextIndex;
            setActiveIndex(nextIndex);

            gsap.to(wrapperRef.current, {
                x: getCenterOffset(nextIndex),
                duration: 0.8,
                ease: "power3.inOut",
            });

            cardRefs.current.forEach((card, idx) => {
                if (card) {
                    const isActive = idx === nextIndex;
                    gsap.to(card, {
                        scale: isActive ? 1.1 : 0.9,
                        opacity: isActive ? 1 : 0.5,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                }
            });

            setTimeout(() => { animating.current = false; }, 400);
        };

        // Wheel 事件
        const handleWheel = (e: WheelEvent) => {
            if (!window.isProjectsHorizontalScrolling) return;

            let delta = 0;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                delta = e.deltaX;
            } else {
                delta = e.deltaY;
            }
            if (Math.abs(delta) < 20) return;
            navigateCard(delta > 0 ? 1 : -1);
        };

        // Touch 事件
        const handleTouchStart = (e: TouchEvent) => {
            if (!window.isProjectsHorizontalScrolling) return;
            touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!window.isProjectsHorizontalScrolling || !touchStartRef.current) return;
            const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
            const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
            touchStartRef.current = null;
            // 水平滑动距离 > 50px 且大于垂直距离才触发
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                navigateCard(dx < 0 ? 1 : -1);
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('slideChanged', handleSlideChanged as EventListener);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            ctx.revert();
        }
    }, [])

    return (
        // Overscroll hidden on X, but smooth Lenis scroll on Y triggers X translation
        <div ref={sectionRef} className="w-full relative z-10">
            <div className="px-6 md:px-12 pt-32 pb-16 h-screen max-w-7xl mx-auto flex flex-col justify-center absolute top-0 pointer-events-none z-10 w-full">
                <h1 ref={headerRef} className="text-6xl md:text-8xl font-serif text-white/10 select-none">Showcase.</h1>
            </div>

            <div className="h-screen flex items-center">
                <div
                    ref={wrapperRef}
                    className="flex gap-12 px-6 md:px-32 w-max will-change-transform"
                >
                    {/* Spacer block for initial margin matching horizontal alignment */}
                    <div className="w-[10vw] shrink-0" />

                    {projects.map((project, i) => (
                        <div
                            key={project.id}
                            ref={el => { cardRefs.current[i] = el }}
                            className="shrink-0 w-[75vw] md:w-[45vw] lg:w-[30vw] h-[45vh] md:h-[55vh] flex flex-col relative py-4 px-2 origin-center"
                        >
                            <a
                                href={project.url || '#'}
                                target={project.url ? '_blank' : '_self'}
                                rel="noreferrer"
                                className="group flex-1 w-full bg-zinc-900 rounded-2xl border border-white/[0.08] hover:border-white/15 overflow-hidden relative block outline-none cursor-pointer shadow-lg shadow-black/20 transition-[border-color] duration-500"
                            >
                                {/* Background image or fallback */}
                                <div className="absolute inset-0 bg-black">
                                    {projectImages[project.id] ? (
                                        <img
                                            src={projectImages[project.id]}
                                            alt={project.name}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700 ease-out"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black group-hover:from-zinc-700 transition-colors duration-1000 ease-out flex items-center justify-center">
                                            <span className="font-serif text-[10rem] md:text-[14rem] text-zinc-800 opacity-20 select-none group-hover:opacity-40 transition-opacity duration-700 translate-y-8 group-hover:translate-y-0">
                                                0{i + 1}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Gradient overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-[1]" />

                                <div className="absolute inset-x-8 bottom-8 z-10 flex flex-col justify-end h-full">
                                    <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest block mb-4 group-hover:text-zinc-300 transition-colors duration-500">
                                        Project // {String(i + 1).padStart(2, '0')}
                                    </span>

                                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-2 group-hover:text-white transition-colors duration-500">
                                        {project.name}
                                    </h2>

                                    <div className="w-8 h-px bg-white/20 mb-4 transform origin-left transition-all duration-700 group-hover:w-16 group-hover:bg-white" />

                                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-700 opacity-0 group-hover:opacity-100">
                                        <div className="overflow-hidden">
                                            <span className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                                                View Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}

                    {/* Spacer block end */}
                    <div className="w-[20vw] shrink-0" />
                </div>
            </div>

            {/* Fixed bottom description panel */}
            <div ref={descPanelRef} className="absolute bottom-8 left-0 right-0 z-20 px-8 md:px-16">
                <div className="max-w-2xl mx-auto relative h-24">
                    {projects.map((project, i) => (
                        <div
                            key={project.id}
                            className={`absolute inset-0 flex items-start gap-6 transition-all duration-500 ${activeIndex === i ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'}`}
                        >
                            <span className="text-zinc-400 font-mono text-xs tracking-widest shrink-0 pt-1">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div
                                className="border-l border-white/10 pl-6 overflow-y-auto max-h-24 scrollbar-hide"
                                onWheel={(e) => {
                                    const el = e.currentTarget;
                                    const atTop = el.scrollTop === 0;
                                    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
                                    // Only stop propagation when there's room to scroll internally
                                    if (el.scrollHeight > el.clientHeight && !(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0)) {
                                        e.stopPropagation();
                                    }
                                }}
                            >
                                <div
                                    className="text-zinc-300 text-sm leading-relaxed prose prose-invert prose-p:my-1 prose-ul:my-1 prose-ul:pl-4 prose-li:my-0 prose-strong:text-white prose-strong:font-bold"
                                    dangerouslySetInnerHTML={{ __html: project.description }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
