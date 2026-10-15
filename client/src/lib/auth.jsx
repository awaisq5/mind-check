import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    api('/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('mindcheck:logout', onLogout)
    return () => window.removeEventListener('mindcheck:logout', onLogout)
  }, [])

  const login = useCallback(async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } })
    setToken(d.token)
    setUser(d.user)
  }, [])

  const register = useCallback(async (form) => {
    const d = await api('/auth/register', { method: 'POST', body: form })
    setToken(d.token)
    setUser(d.user)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const updateSettings = useCallback(async (patch) => {
    const d = await api('/me', { method: 'PATCH', body: patch })
    setUser(d.user)
    return d.user
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout, updateSettings, setUser }), [user, loading, login, register, logout, updateSettings])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
