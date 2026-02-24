import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { Search, Menu, X } from 'lucide-react'
import { useUIStore } from '../store/useUIStore'

export default function Navbar() {
    const location = useLocation()
    const { setSearchOpen } = useUIStore()
    const [mobileOpen, setMobileOpen] = useState(false)

    // 路由切换时关闭移动菜单
    useEffect(() => { setMobileOpen(false) }, [location.pathname])

    const links = [
        { name: 'Home', path: '/' },
        { name: 'Articles', path: '/blog' },
    ]

    return (
        <nav className="fixed top-4 left-4 right-4 z-50 bg-zinc-950/60 backdrop-blur-xl border border-white/5 rounded-2xl md:max-w-5xl md:mx-auto md:top-6 transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4">
                <Link to="/" className="font-serif text-xl tracking-wider select-none outline-none group cursor-pointer">
                    <span className="text-white group-hover:text-zinc-300 transition-colors duration-300">AROH</span>
                    <span className="text-zinc-500 group-hover:text-zinc-400 transition-colors duration-300">TEA</span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path || location.pathname + location.hash === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "outline-none transition-colors duration-300 hover:text-white relative cursor-pointer group/link py-1",
                                    isActive ? "text-white" : "text-zinc-400"
                                )}
                            >
                                {link.name}
                                <span className="absolute -bottom-0.5 left-0 h-px bg-white/60 transition-all duration-300 ease-out w-0 group-hover/link:w-full" />
                                <span className={clsx(
                                    "absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.4)] transition-all duration-300",
                                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                                )} />
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="p-2 text-zinc-400 hover:text-white transition-colors duration-300 outline-none rounded-full hover:bg-white/5 cursor-pointer"
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors duration-300 outline-none rounded-full hover:bg-white/5 cursor-pointer"
                        aria-label="Menu"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* 移动端下拉菜单 */}
            <div className={clsx(
                "md:hidden overflow-hidden transition-all duration-300 ease-out",
                mobileOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="px-6 pb-4 pt-2 border-t border-white/5 flex flex-col gap-1">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setMobileOpen(false)}
                                className={clsx(
                                    "py-3 px-3 rounded-xl text-sm font-medium transition-colors duration-200",
                                    isActive ? "text-white bg-white/5" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {link.name}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
