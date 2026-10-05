import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Globe, Clock, Layers } from 'lucide-react'
import api from '../lib/axios'

interface Project {
  id: string
  name: string
  initialPrompt: string
  currentCode: string | null
  isPublic: boolean
  createdAt: string
}

const MyProjects = () => {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/project/mine')
      .then((res) => setProjects(res.data.projects))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] px-6 md:px-16 lg:px-24 xl:px-32 py-16">

      {/* Background orb */}
      <div className="orb w-80 h-80 bg-violet-600 top-0 right-0" />

      {projects.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-10 animate-fade-up opacity-0">
            <div>
              <h1 className="text-3xl font-bold text-white">My Projects</h1>
              <p className="text-gray-500 mt-1 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} created</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="btn-glow flex items-center gap-2 text-white px-5 py-2.5 rounded-full text-sm font-medium"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, i) => (
              <div
                key={project.id}
                onClick={() => navigate(`/preview/${project.id}`)}
                className="glass glass-hover card-shine rounded-2xl p-5 cursor-pointer animate-fade-up opacity-0"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Preview thumbnail placeholder */}
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center mb-4 overflow-hidden">
                  {project.currentCode ? (
                    <div className="text-xs text-gray-600 font-mono px-3 text-center line-clamp-4 opacity-60">
                      {project.currentCode.slice(0, 120)}...
                    </div>
                  ) : (
                    <Layers size={24} className="text-gray-700" />
                  )}
                </div>

                <h2 className="font-semibold text-white text-sm leading-snug line-clamp-1">{project.name}</h2>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{project.initialPrompt}</p>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={11} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  {project.isPublic && (
                    <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                      <Globe size={10} />
                      Published
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-32 animate-fade-up opacity-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center mb-6 animate-float">
            <Layers size={32} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">No projects yet</h1>
          <p className="text-gray-500 mt-2 max-w-sm">Create your first AI-generated website in seconds</p>
          <button
            onClick={() => navigate('/')}
            className="btn-glow mt-8 flex items-center gap-2 text-white px-6 py-3 rounded-full text-sm font-medium"
          >
            <Plus size={16} />
            <span>Create your first project</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default MyProjects
