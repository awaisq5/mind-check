import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Home from './pages/Home'
import CheckIn from './pages/CheckIn'
import Results from './pages/Results'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Progress from './pages/Progress'
import SupportAlert from './pages/SupportAlert'
import SupportOptions from './pages/SupportOptions'
import StatusBar from './components/StatusBar'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <StatusBar />
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/results" element={<Results />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/support-alert" element={<SupportAlert />} />
          <Route path="/support" element={<SupportOptions />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}