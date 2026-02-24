import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { mockPosts } from '../../data'
import { format } from 'date-fns'

export default function Blog() {
    const containerRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    // Minimal client-side filter
    const [filter, setFilter] = useState<string>('全部')
    const categories = ['全部', '设计', '技术']

    const filteredPosts = filter === '全部' ? mockPosts : mockPosts.filter(p => {
        if (filter === '设计') return p.category === 'Design'
        if (filter === '技术') return p.category === 'Tech'
        return true
    })

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Header Animation
            gsap.from(headerRef.current, {
                y: 30, opacity: 0, duration: 1, ease: 'power3.out'
            })

            // Cards Staggered Animation
            // Note: In real app, re-trigger on filter change. For simplicity, just on mount.
            if (containerRef.current) {
                gsap.fromTo(containerRef.current.children,
                    { y: 50, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
                )
            }
        })

        return () => ctx.revert()
    }, []) // run once on mount

    return (
        <div className="w-full min-h-screen pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-12 max-w-5xl mx-auto">
            <div ref={headerRef} className="mb-10 md:mb-16">
                <h1 className="text-4xl md:text-7xl font-serif text-white mb-4 md:mb-6">文章.</h1>
                <p className="text-zinc-300 text-lg md:text-xl max-w-2xl font-light">
                    关于设计、技术与优雅工程的思考、教程与洞察。
                </p>

                {/* Filters */}
                <div className="flex items-center gap-3 mt-8 md:mt-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-4 py-2.5 md:py-1.5 rounded-full text-sm font-mono tracking-wide transition-all duration-300 border cursor-pointer ${filter === cat
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div ref={containerRef} className="grid grid-cols-1 gap-0">
                {filteredPosts.map(post => (
                    <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        className="group block border-t border-zinc-800/50 py-8 px-4 -mx-4 rounded-lg hover:bg-white/[0.02] transition-all duration-500 cursor-pointer"
                    >
                        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-zinc-800 rounded-full px-2.5 py-0.5">
                                    {post.category}
                                </span>
                                <h2 className="text-2xl md:text-3xl font-serif text-white group-hover:text-zinc-300 transition-colors duration-300">
                                    {post.title}
                                </h2>
                            </div>
                            <div className="text-zinc-400 font-mono text-xs shrink-0">
                                {format(new Date(post.date), 'MMM dd, yyyy')}
                            </div>
                        </div>
                        <p className="text-zinc-300 font-light max-w-3xl leading-relaxed text-sm md:text-base">
                            {post.excerpt}
                        </p>
                        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-white transition-all duration-300">
                            <span className="w-0 group-hover:w-6 h-px bg-white transition-all duration-300" />
                            阅读文章
                            <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
