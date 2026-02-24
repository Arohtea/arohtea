import { useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import gsap from 'gsap'
import { mockPosts } from '../../data'
import { getPostComponent } from '../../data/posts'
import { ArrowLeft } from 'lucide-react'

export default function ArticleDetail() {
    const { id } = useParams()
    const post = mockPosts.find(p => p.id === id) || mockPosts[0]

    // Dynamically retrieve the pre-compiled Component from our mapped local files
    const PostContent = getPostComponent(post.id)

    const progressRef = useRef<HTMLDivElement>(null)
    const headerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Scroll progress bar
        const updateProgress = () => {
            if (!progressRef.current) return
            const scrollPx = document.documentElement.scrollTop
            const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight

            // Prevent divide by zero error on short pages
            if (winHeightPx <= 0) return

            const scrollLen = `${(scrollPx / winHeightPx) * 100}%`
            gsap.to(progressRef.current, { width: scrollLen, duration: 0.1, ease: 'none' })
        }

        // Header fade in
        gsap.fromTo(headerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' })

        window.addEventListener('scroll', updateProgress)
        return () => window.removeEventListener('scroll', updateProgress)
    }, [])

    return (
        <div className="w-full relative">
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 h-[2px] w-full bg-white/5 z-[100]">
                <div ref={progressRef} className="h-full bg-white w-0 shadow-[0_0_10px_2px_rgba(255,255,255,0.4)]" />
            </div>

            <article className="min-h-screen pt-24 md:pt-32 pb-16 md:pb-32 px-4 md:px-12 max-w-4xl mx-auto">
                <div className="mb-12">
                    <Link to="/blog" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-8 group">
                        <ArrowLeft size={16} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                        返回文章列表
                    </Link>

                    <div ref={headerRef} className="relative z-10 opacity-0">
                        <div className="flex items-center gap-4 mb-6 text-sm font-mono text-zinc-400">
                            <span className="text-zinc-300 border border-white/20 rounded-full px-3 py-1 bg-white/5">{post.category}</span>
                            <span>{post.date}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 leading-[1.1] drop-shadow-lg">
                            {post.title}
                        </h1>
                        <p className="text-xl text-zinc-300 font-light leading-relaxed drop-shadow-md">
                            {post.excerpt}
                        </p>
                    </div>
                </div>

                {/* Markdown Content rendered via Mode.REACT from vite-plugin-markdown */}
                <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:text-white prose-h1:hidden prose-h2:text-white prose-h3:text-white prose-h4:text-white prose-h5:text-white prose-h6:text-white text-zinc-300 prose-p:font-light prose-p:leading-[1.8] prose-p:text-zinc-200 prose-li:text-zinc-200 prose-pre:bg-zinc-900/60 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-code:text-white prose-code:font-mono prose-code:bg-transparent prose-code:before:content-none prose-code:after:content-none prose-a:text-white prose-a:underline-offset-4 prose-a:decoration-white/30 hover:prose-a:decoration-white prose-blockquote:border-l-white/20 prose-blockquote:text-zinc-300 prose-blockquote:font-light prose-blockquote:italic prose-hr:border-white/10 prose-img:rounded-xl prose-strong:text-white prose-strong:font-bold prose-h2:mt-12 prose-h2:mb-4 prose-h3:mt-8 prose-h3:mb-3">
                    {PostContent ? <PostContent /> : <div className="text-zinc-400 italic">内容加载失败。</div>}
                </div>
            </article>
        </div>
    )
}
