import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react'
import { authClient } from '../../lib/authClient'
import { toast } from 'sonner'

const AuthPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    try {
      setLoading(true)
      if (mode === 'signup') {
        await authClient.signUp.email({ name: form.name, email: form.email, password: form.password })
        toast.success("Account created! You've received 20 free credits.")
      } else {
        await authClient.signIn.email({ email: form.email, password: form.password })
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Check your details and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] flex items-center justify-center px-6">

      {/* Background orbs */}
      <div className="orb w-80 h-80 bg-violet-600 top-0 left-1/4" />
      <div className="orb w-64 h-64 bg-blue-600 bottom-0 right-1/4" />

      <div className="w-full max-w-sm animate-fade-up opacity-0">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to continue building' : 'Start with 20 free credits'}
          </p>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all duration-200"
              />
            </div>
          )}

          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Email address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all duration-200"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-glow w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-5 w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200"
        >
          {mode === 'signin'
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

export default AuthPage
