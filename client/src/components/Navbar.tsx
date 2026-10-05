import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession, signOut } from '../lib/authClient'
import { Zap, LogOut, Sparkles } from 'lucide-react'
import api from '../lib/axios'

const Navbar = () => {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const [credits, setCredits] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (session?.user) {
      api.get('/api/user/me')
        .then((res) => setCredits(res.data.user.credits))
        .catch(() => setCredits(null))
    } else {
      setCredits(null)
    }
  }, [session])

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-white/5'
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-110">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          SiteBuilder
        </span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {[
          { label: 'My Projects', to: '/my-projects' },
          { label: 'Community', to: '/community' },
          { label: 'Pricing', to: '/pricing' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="px-4 py-2 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Auth section */}
      {session?.user ? (
        <div className="flex items-center gap-3">
          {credits !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
              <Zap size={12} className="fill-violet-400 text-violet-400" />
              {credits} credits
            </div>
          )}
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="btn-glow text-white px-5 py-2 rounded-full text-sm font-medium"
        >
          <span>Get Started</span>
        </button>
      )}
    </nav>
  )
}

export default Navbar
