import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import PageLayout from './components/PageLayout'
import SearchModal from './components/SearchModal'
import NoiseOverlay from './components/NoiseOverlay'
import DynamicBackground from './components/DynamicBackground'

import Home from './pages/Home'
import Blog from './pages/Blog'
import ArticleDetail from './pages/ArticleDetail'

function App() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [location.pathname])

  return (
    <div className="bg-black text-slate-50 min-h-screen font-sans selection:bg-white/20">
      <NoiseOverlay />
      <DynamicBackground />
      <CustomCursor />
      <Navbar />
      <SearchModal />

      <main className="relative z-10">
        {/* We use location.pathname to force re-render/re-mount of PageLayout on route change */}
        <PageLayout key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<ArticleDetail />} />
          </Routes>
        </PageLayout>
      </main>
    </div>
  )
}

export default App
