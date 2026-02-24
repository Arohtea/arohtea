import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useUIStore } from '../store/useUIStore'
import { mockPosts, type Post } from '../data'

const fuse = new Fuse(mockPosts, {
    keys: ['title', 'excerpt', 'category'],
    threshold: 0.4
})

export default function SearchModal() {
    const { isSearchOpen, setSearchOpen } = useUIStore()
    const modalRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    const results = query ? fuse.search(query).map(r => r.item) : mockPosts.slice(0, 3) // default top 3

    useEffect(() => {
        // Cmd+K shortcut
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
            }
            if (e.key === 'Escape') {
                setSearchOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setSearchOpen])

    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden'
            // Animate in
            gsap.fromTo(modalRef.current,
                { opacity: 0, backdropFilter: 'blur(0px)' },
                { opacity: 1, backdropFilter: 'blur(16px)', duration: 0.3, ease: 'power2.out' }
            )
            const searchCard = modalRef.current?.querySelector('.search-card') || null;
            gsap.fromTo(searchCard,
                { scale: 0.95, opacity: 0, y: 20 },
                { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)', delay: 0.1 }
            )
            inputRef.current?.focus()
        } else {
            document.body.style.overflow = ''
        }
    }, [isSearchOpen])

    if (!isSearchOpen) return null

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] md:pt-[15vh] px-4 bg-black/60 backdrop-blur-md"
            onClick={(e) => {
                if (e.target === e.currentTarget) setSearchOpen(false)
            }}
        >
            <div className="search-card w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header/Input */}
                <div className="flex items-center px-6 py-4 border-b border-white/10 relative">
                    <Search className="text-zinc-500 w-5 h-5 absolute left-6" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="搜索文章... (Cmd + K)"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white text-lg pl-10 pr-4 placeholder:text-zinc-600 focus:ring-0"
                    />
                    <button
                        onClick={() => setSearchOpen(false)}
                        className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 transition-colors absolute right-6 font-mono text-xs"
                    >
                        ESC
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto px-2 py-4">
                    <div className="px-4 pb-2 text-xs font-mono text-zinc-500 uppercase tracking-widest">
                        {query ? '搜索结果' : '最近文章'}
                    </div>
                    {results.length > 0 ? (
                        <ul className="space-y-1">
                            {results.map((post: Post) => (
                                <li key={post.id}>
                                    <button
                                        onClick={() => {
                                            setSearchOpen(false)
                                            navigate(`/blog/${post.id}`)
                                        }}
                                        className="w-full text-left px-4 py-4 rounded-xl hover:bg-white/5 transition-colors group flex items-center justify-between outline-none focus:bg-white/5"
                                    >
                                        <div>
                                            <h4 className="text-white font-medium group-hover:text-zinc-300">{post.title}</h4>
                                            <p className="text-sm text-zinc-400 line-clamp-1 mt-1">{post.excerpt}</p>
                                        </div>
                                        <span className="text-zinc-600 group-hover:text-white transition-colors">→</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-12 text-center text-zinc-400">
                            未找到与 "{query}" 相关的结果。
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
