import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Zap, Globe, Wand2 } from 'lucide-react'
import api from '../lib/axios'

const EXAMPLE_PROMPTS = [
  'A portfolio website for a photographer',
  'A landing page for a SaaS startup',
  'An e-commerce store for handmade jewelry',
  'A restaurant website with menu and reservations',
]

const FEATURES = [
  { icon: Zap, title: 'Instant Generation', desc: 'From prompt to live preview in under 30 seconds' },
  { icon: Wand2, title: 'AI-Powered', desc: 'Smart 2-step AI that enhances your idea first' },
  { icon: Globe, title: 'Publish & Share', desc: 'One click to share your site with the world' },
]

const Home = () => {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/project', { prompt })
      navigate(`/preview/${data.project.id}`)
    } catch (err: any) {
      if (err?.response?.status === 401) { navigate('/auth'); return }
      setError(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-violet-600 top-[-100px] left-[-100px]" />
      <div className="orb w-80 h-80 bg-blue-600 top-20 right-[-80px]" />
      <div className="orb w-64 h-64 bg-fuchsia-600 bottom-40 left-1/3" />

      {/* Hero */}
      <div className="relative flex flex-col items-center px-6 md:px-16 pt-20 pb-16 text-center">

        {/* Badge */}
        <div className="animate-fade-up opacity-0 delay-100 inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-violet-500/30 text-violet-300 text-xs font-medium mb-8">
          <Sparkles size={12} className="animate-pulse" />
          AI-Powered Website Generator
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up opacity-0 delay-200 text-5xl md:text-7xl font-bold max-w-4xl leading-tight">
          Turn thoughts into{' '}
          <span className="text-shimmer">websites</span>
          {' '}instantly
        </h1>

        <p className="animate-fade-up opacity-0 delay-300 text-gray-400 max-w-lg mt-6 text-lg leading-relaxed">
          Describe the website you want and let AI build it in seconds. No coding required.
        </p>

        {/* Prompt box */}
        <form
          onSubmit={handleSubmit}
          className="animate-fade-up opacity-0 delay-400 w-full max-w-2xl mt-10"
        >
          <div className="prompt-box p-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
              }}
              placeholder="e.g. Create a portfolio website for a photographer with dark theme and gallery..."
              rows={3}
              className="w-full resize-none bg-transparent outline-none text-sm text-white placeholder-gray-500"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2 flex-wrap">
                {EXAMPLE_PROMPTS.slice(0, 2).map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-400 hover:bg-violet-500/20 hover:text-violet-300 transition-all duration-200 border border-white/8"
                  >
                    {ex.slice(0, 28)}…
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-glow flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create with AI</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm mt-3 animate-fade-in">{error}</p>
          )}
        </form>

        {/* Example prompts row */}
        <div className="animate-fade-up opacity-0 delay-500 flex flex-wrap justify-center gap-2 mt-6">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              className="text-xs px-3 py-1.5 rounded-full glass glass-hover text-gray-400 hover:text-white transition-all duration-200"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Features section */}
      <div className="relative px-6 md:px-16 lg:px-24 xl:px-32 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`glass glass-hover card-shine rounded-2xl p-6 animate-fade-up opacity-0`}
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mb-4">
                <f.icon size={18} className="text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Home
