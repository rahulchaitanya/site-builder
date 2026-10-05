import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/home'
import MyProjects from './pages/myprojects'
import Preview from './pages/preview'
import Pricing from './pages/pricing'
import View from './pages/view'
import Community from './pages/community'
import AuthPage from './pages/auth/AuthPage'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/view/:id" element={<View />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </>
  )
}

export default App
