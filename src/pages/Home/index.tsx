import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/all'
import { profile, education } from '../../data'

import About from '../About'
import Projects from '../Projects'

declare global {
    interface Window {
        isProjectsHorizontalScrolling?: boolean;
        isSlideAnimationLocked?: boolean;
        scrollObserver?: any;
        gotoSlide?: (index: number, direction: number) => void;
        homeCurrentIndex?: () => number;
    }
}

gsap.registerPlugin(ScrollTrigger, Observer)

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null)
    const slidesRef = useRef<HTMLElement[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onStart: () => {
                    window.isSlideAnimationLocked = true
                    if (window.scrollObserver) window.scrollObserver.disable()
                },
                onComplete: () => {
                    window.isSlideAnimationLocked = false
                    if (window.scrollObserver) window.scrollObserver.enable()
                }
            })

            // --- Step 1: Arohtea / 李思源 In ---
            tl.from('.hero-word-1', {
                y: 100,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power4.out',
                delay: 0.1
            })

            // Hold
            tl.to({}, { duration: 0.4 })

            // --- Step 1 Out (Flip Up) ---
            tl.to('.hero-word-1', {
                y: -100,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.in'
            }, '+=0.1') // Small overlap/wait

            // --- Step 2: Software / Developer In (Flip Down/Reveal) ---
            tl.set('.hero-step-2', { opacity: 1 }) // Make container visible

            tl.from('.hero-word-2', {
                y: 100,
                rotationX: -90, // Flip effect
                opacity: 0,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.2') // Overlap slightly with exit

            // Line animation
            tl.to('.hero-line', {
                scaleX: 1,
                transformOrigin: 'left',
                duration: 0.6,
                ease: 'power3.inOut'
            }, '-=0.4')

            // Description & CTA
            tl.to('.hero-sub', {
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, '-=0.3')

            // Parallax Effect
            if (containerRef.current) {
                gsap.to('.hero-bg-shape', {
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1
                    },
                    yPercent: 50,
                    ease: 'none'
                })

                gsap.to('.hero-content', {
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: 1
                    },
                    yPercent: 20,
                    ease: 'none'
                })
            }
        })

        return () => ctx.revert()
    }, [])

    // --- Full Page Snapping Architecture ---
    const currentIndexRef = useRef(0);

    useLayoutEffect(() => {
        const slides = slidesRef.current;
        if (!slides.length) return;

        // Position slides
        gsap.set(slides, {
            zIndex: (i) => slides.length - i,
            yPercent: (i) => i === 0 ? 0 : 100 // Start with first slide at 0, rest below
        });

        let observer: globalThis.Observer;

        const gotoSlide = (index: number, direction: number) => {
            if (index < 0 || index > slides.length - 1) return;

            // Lock observer during animation to prevent double-scroll bounces
            if (observer) observer.disable();

            const currentSlide = slides[currentIndexRef.current];
            const nextSlide = slides[index];

            // Animate transition based on direction
            const tl = gsap.timeline({
                onComplete: () => {
                    currentIndexRef.current = index;
                    setCurrentIndex(index);
                    // Emit custom event for slides to listen to (like Projects)
                    window.dispatchEvent(new CustomEvent('slideChanged', { detail: { index } }));
                    // Re-enable observer after brief buffer, unless a slide locked it
                    setTimeout(() => {
                        if (observer && !window.isSlideAnimationLocked) observer.enable();
                    }, 50);
                }
            });

            if (direction > 0) { // Scrolling down -> pushing current up, bringing next up from bottom
                tl.to(currentSlide, { yPercent: -100, duration: 1, ease: "power3.inOut" })
                    .fromTo(nextSlide, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "power3.inOut" }, 0);
            } else { // Scrolling up -> bringing current down to bottom, pulling prev down from top
                tl.to(currentSlide, { yPercent: 100, duration: 1, ease: "power3.inOut" })
                    .fromTo(nextSlide, { yPercent: -100 }, { yPercent: 0, duration: 1, ease: "power3.inOut" }, 0);
            }
        };

        observer = Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            wheelSpeed: -1,
            onUp: () => {
                if (window.isProjectsHorizontalScrolling && currentIndexRef.current === 2) return;
                gotoSlide(currentIndexRef.current + 1, 1);
            },
            onDown: () => {
                if (window.isProjectsHorizontalScrolling && currentIndexRef.current === 2) return;
                gotoSlide(currentIndexRef.current - 1, -1);
            },
            tolerance: 20, // Increase tolerance to avoid hyper-sensitivity
            preventDefault: true
        });

        // Add to global to let children (Projects) control scroll lock
        window.scrollObserver = observer;
        window.gotoSlide = gotoSlide;
        window.homeCurrentIndex = () => currentIndexRef.current;

        return () => {
            observer.kill();
            window.scrollObserver = undefined;
            window.gotoSlide = undefined;
            window.homeCurrentIndex = undefined;
        };
    }, [])

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden relative">

            {/* Slide 0: Hero Section */}
            <section ref={el => { if (el) slidesRef.current[0] = el }} className="slide absolute inset-0 w-full h-full flex flex-col justify-center px-6 pt-20 overflow-hidden z-[4]">
                {/* Abstract Background Shape */}
                <div className="hero-bg-shape absolute top-1/4 right-0 w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] bg-white rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

                <div className="hero-content max-w-[90%] mx-auto z-10 relative w-full">
                    {/* Intro Step 1: Arohtea / 李思源 */}
                    <div className="hero-step-1 absolute inset-0 flex flex-col font-serif font-black text-[10vw] md:text-[8.3vw] leading-[0.9] tracking-tighter uppercase text-white mix-blend-difference break-all md:break-normal pointer-events-none">
                        <div className="overflow-hidden">
                            <span className="hero-word-1 block origin-bottom">
                                Arohtea
                            </span>
                        </div>
                        <div className="overflow-hidden">
                            <span className="hero-word-1 block origin-bottom mt-2 md:mt-4">
                                李思源
                            </span>
                        </div>
                    </div>

                    {/* Intro Step 2: Software / Developer */}
                    <div className="hero-step-2 flex flex-col font-serif font-black text-[10vw] md:text-[8.3vw] leading-[0.9] tracking-tighter uppercase text-white mix-blend-difference break-all md:break-normal opacity-0">
                        <div className="overflow-hidden">
                            <span className="hero-word-2 block origin-top">
                                Software
                            </span>
                        </div>
                        <div className="flex items-center gap-4 overflow-hidden flex-wrap md:flex-nowrap">
                            <span className="hero-line h-[3vw] md:h-[1.5vw] bg-white flex-grow block mt-4 min-w-[50px] scale-x-0"></span>
                            <span className="hero-word-2 block origin-top">
                                Developer
                            </span>
                        </div>
                    </div>

                    {/* Subtitle & CTA */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-16 hero-sub opacity-0 translate-y-8">
                        <div className="md:col-span-12 lg:col-span-5 lg:col-start-8">
                            <p className="text-xl md:text-2xl font-light text-zinc-300 mb-8 border-l-2 border-white pl-6">
                                构建高性能系统与极致用户体验。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Decorative Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none"></div>
            </section>

            {/* Slide 1: About / Skills */}
            <div ref={el => { if (el) slidesRef.current[1] = el }} className="slide absolute inset-0 w-full h-full overflow-hidden z-[3]">
                <About />
            </div>

            {/* Slide 2: Projects (Will handle horizontal internally) */}
            <div ref={el => { if (el) slidesRef.current[2] = el }} className="slide absolute inset-0 w-full h-full z-[2]">
                <Projects />
            </div>

            {/* Slide 3: Contact & Footer */}
            <div ref={el => { if (el) slidesRef.current[3] = el }} className="slide absolute inset-0 w-full h-full bg-[#0a0a0a] flex flex-col justify-between px-6 md:px-12 text-zinc-300 z-[1]">
                <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">

                    {/* Hero heading */}
                    <h2 className="text-4xl md:text-8xl font-serif font-black tracking-tighter text-white mb-10 md:mb-16 leading-none">
                        Let's Connect<span className="text-zinc-600">.</span>
                    </h2>

                    {/* Two-column: Education + Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 mb-10 md:mb-16">

                        {/* Education */}
                        {education.length > 0 && (
                            <div>
                                <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-6">Education</h3>
                                {education.map(edu => (
                                    <div key={edu.id} className="border-l-2 border-white/10 pl-5">
                                        <h4 className="text-lg font-serif text-white">{edu.school}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">{edu.area} / {edu.degree}</p>
                                        <span className="text-xs font-mono text-zinc-600 mt-2 block">GPA {edu.grade}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Contact */}
                        <div>
                            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase mb-6">Contact</h3>
                            <div className="space-y-4">
                                <div className="border-l-2 border-white/10 pl-5">
                                    <span className="text-xs font-mono text-zinc-600 block mb-1">Location</span>
                                    <span className="text-white">{profile.location}</span>
                                </div>
                                <div className="border-l-2 border-white/10 pl-5">
                                    <span className="text-xs font-mono text-zinc-600 block mb-1">Email</span>
                                    <a href="mailto:13541325053@163.com" className="text-white hover:text-zinc-400 transition-colors block">13541325053@163.com</a>
                                    <a href="mailto:1771396362@qq.com" className="text-white hover:text-zinc-400 transition-colors block">1771396362@qq.com</a>
                                </div>
                                <div className="border-l-2 border-white/10 pl-5">
                                    <span className="text-xs font-mono text-zinc-600 block mb-1">Phone</span>
                                    <span className="text-white">{profile.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom bar */}
                <div className="max-w-5xl mx-auto w-full pb-8 border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-6">
                        <a href="https://github.com/Arohtea" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                            GitHub
                        </a>
                        <a href="https://gitee.com/arohtea" target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                            Gitee
                        </a>
                        <a href="mailto:13541325053@163.com" className="group flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                            Email
                        </a>
                    </div>
                    <span className="text-xs font-mono text-zinc-600">&copy; {new Date().getFullYear()} Arohtea. All rights reserved.</span>
                </div>
            </div>
            {/* Slide position indicator */}
            <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
                {['Hero', 'About', 'Projects', 'Contact'].map((label, i) => (
                    <button
                        key={label}
                        onClick={() => {
                            const dir = i > (currentIndexRef.current) ? 1 : -1
                            window.gotoSlide?.(i, dir)
                        }}
                        className="group relative flex items-center justify-end cursor-pointer outline-none"
                        aria-label={`Go to ${label}`}
                    >
                        <span className="absolute right-5 text-[10px] font-mono text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                            {label}
                        </span>
                        <span className={`block rounded-full transition-all duration-300 ${
                            currentIndex === i
                                ? 'w-2 h-2 bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.3)]'
                                : 'w-1.5 h-1.5 bg-zinc-600 hover:bg-zinc-400'
                        }`} />
                    </button>
                ))}
            </div>

        </div>
    )
}
