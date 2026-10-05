import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, User, Clock, Sparkles } from 'lucide-react'
import api from '../lib/axios'

interface Project {
  id: string
  name: string
  initialPrompt: string
  createdAt: string
  user: { name: string }
}

const Community = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/project/community')
      .then((res) => setProjects(res.data.projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading community projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] px-6 md:px-16 lg:px-24 xl:px-32 py-16">

      {/* Background orb */}
      <div className="orb w-96 h-96 bg-blue-600 top-0 right-0" />

      {/* Header */}
      <div className="mb-12 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-blue-500/30 text-blue-300 text-xs font-medium mb-4">
          <Globe size={12} />
          Community
        </div>
        <h1 className="text-3xl font-bold text-white">Published Websites</h1>
        <p className="text-gray-500 mt-1">Sites built and shared by the community</p>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <div
              key={project.id}
              onClick={() => navigate(`/view/${project.id}`)}
              className="glass glass-hover card-shine rounded-2xl overflow-hidden cursor-pointer animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {/* Thumbnail */}
              <div className="w-full h-36 bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-b border-white/5 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5" />
                <Globe size={28} className="text-gray-700" />
                <div className="absolute top-2 right-2">
                  <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h2 className="font-semibold text-white text-sm line-clamp-1">{project.name}</h2>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{project.initialPrompt}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <User size={11} />
                    {project.user?.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={11} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-32 animate-fade-up opacity-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center mb-6 animate-float">
            <Sparkles size={32} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">No published projects yet</h2>
          <p className="text-gray-500 mt-2 max-w-sm text-sm">
            Be the first to publish a website! Generate one and click Publish.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-glow mt-8 text-white px-6 py-3 rounded-full text-sm font-medium"
          >
            <span>Create & Publish</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default Community
