import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { saveAuth } from '../auth'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = mode === 'register' ? { name, email, password } : { email, password }
      const data = mode === 'register' ? await api.register(payload) : await api.login(payload)
      saveAuth(data)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-no-nav" style={{ justifyContent: 'center' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="mt-8">
          {mode === 'login' ? 'Log in to continue your wellbeing journey' : 'Sign up to save check-ins and track progress'}
        </p>
      </div>

      <div className="chip-row" style={{ marginBottom: 18 }}>
        <button className={`chip ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Login</button>
        <button className={`chip ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Sign Up</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'register' && (
          <div className="input-group">
            <label className="input-label">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Awais" />
          </div>
        )}

        <div className="input-group">
          <label className="input-label">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>

        <div className="input-group">
          <label className="input-label">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>

        {error && <p style={{ color: 'var(--color-danger)', fontSize: 13, textAlign: 'center' }}>{error}</p>}

        <button className="btn btn-primary mt-8" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
        </button>
      </form>
    </div>
  )
}
