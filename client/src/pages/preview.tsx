import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Download, Globe, Send, Sparkles, Monitor } from 'lucide-react'
import api from '../lib/axios'

interface Message {
  role: string
  content: string
}

const Preview = () => {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/api/project/${id}`)
      setProject(data.project)
      setMessages(data.conversations || [])
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchProject()
    const interval = setInterval(fetchProject, 4000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    try {
      const { data } = await api.post(`/api/project/${id}/update`, { prompt: input })
      setProject(data.project)
      setMessages(data.conversations)
      setInput('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed')
    } finally {
      setSending(false)
    }
  }

  const handleDownload = () => {
    if (!project?.currentCode) return
    const blob = new Blob([project.currentCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'index.html'; a.click()
    URL.revokeObjectURL(url)
  }

  const handlePublish = async () => {
    try {
      await api.patch(`/api/project/${id}/publish`)
      toast.success('Published to community!')
    } catch { toast.error('Failed to publish') }
  }

  if (!project) return (
    <div className="flex items-center justify-center h-[calc(100vh-73px)] bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading project...</p>
      </div>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] h-[calc(100vh-73px)] bg-[#0a0a0a]">

      {/* ── Left: Chat panel ── */}
      <div className="border-r border-white/8 flex flex-col bg-[#0d0d0d]">

        {/* Header */}
        <div className="p-4 border-b border-white/8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={14} className="text-violet-400" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-white truncate">{project.name}</h2>
            <p className="text-xs text-gray-500">AI Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`animate-slide-in-left text-sm rounded-2xl px-4 py-2.5 max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-white/8 text-gray-200 ml-auto rounded-br-sm'
                  : 'bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 text-gray-200 rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          ))}
          {!project.currentCode && (
            <div className="flex items-center gap-3 p-3 rounded-2xl glass border border-violet-500/20">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
              <p className="text-xs text-gray-400">Generating your website...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/8">
          <div className="flex gap-2 items-end glass rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all duration-200">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask for changes..."
              disabled={sending}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-600 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 disabled:opacity-40 hover:opacity-90 transition-all duration-200 hover:scale-105"
            >
              {sending
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={13} className="text-white" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Right: Preview panel ── */}
      <div className="flex flex-col bg-[#111]">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#0d0d0d]">
          <div className="flex items-center gap-2 text-gray-500">
            <Monitor size={14} />
            <span className="text-xs">Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gray-400 hover:text-white glass glass-hover transition-all duration-200"
            >
              <Download size={13} />
              Download
            </button>
            <button
              onClick={handlePublish}
              className="btn-glow flex items-center gap-1.5 text-white px-4 py-1.5 rounded-full text-sm font-medium"
            >
              <Globe size={13} />
              <span>Publish</span>
            </button>
          </div>
        </div>

        {/* iframe */}
        {project.currentCode ? (
          <iframe
            title="preview"
            srcDoc={project.currentCode}
            className="flex-1 w-full bg-white"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4 animate-float">
                <Sparkles size={24} className="text-violet-400" />
              </div>
              <p className="text-gray-400 text-sm">Generating your website...</p>
              <p className="text-gray-600 text-xs mt-1">This takes about 15–30 seconds</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Preview
