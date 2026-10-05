import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/axios'

const View = () => {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [siteCode, setSiteCode] = useState('')

  useEffect(() => {
    api.get(`/api/project/${id}/code`)
      .then((res) => setSiteCode(res.data.code))
      .catch(() => setSiteCode(''))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  if (!siteCode) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-500">This project is not available or not published.</p>
      </div>
    )
  }

  return (
    <iframe
      title="published-site-view"
      srcDoc={siteCode}
      className="w-full h-[calc(100vh-73px)] bg-white"
      sandbox="allow-scripts allow-same-origin"
    />
  )
}

export default View
