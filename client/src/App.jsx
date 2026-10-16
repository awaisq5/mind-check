import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/Layout'
import { Loading } from './components/ui'
import { AuthProvider, useAuth } from './lib/auth'
import Care from './pages/Care'
import CheckIn from './pages/CheckIn'
import Companion from './pages/Companion'
import HelpNow from './pages/HelpNow'
import Landing from './pages/Landing'
import { Login, Register } from './pages/Auth'
import Privacy from './pages/Privacy'
import Questionnaire from './pages/Questionnaire'
import Questionnaires from './pages/Questionnaires'
import Report from './pages/Report'
import SafetyPlan from './pages/SafetyPlan'
import Settings from './pages/Settings'
import Today from './pages/Today'
import Trends from './pages/Trends'

function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <Loading label="Opening Mind Check…" />
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? <Navigate to="/today" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<HelpNow />} />
          <Route element={<RequireAuth />}>
            <Route path="/report" element={<Report />} />
            <Route element={<AppLayout />}>
              <Route path="/today" element={<Today />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/check-in/:date" element={<CheckIn />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/questionnaires" element={<Questionnaires />} />
              <Route path="/questionnaires/:type" element={<Questionnaire />} />
              <Route path="/care" element={<Care />} />
              <Route path="/safety-plan" element={<SafetyPlan />} />
              <Route path="/companion" element={<Companion />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
