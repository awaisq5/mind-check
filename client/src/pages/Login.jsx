import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()

  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const toggleMode = () => {
    setIsSignup((prev) => !prev)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (isSignup) {
      if (!name.trim()) {
        setError('Please enter your name.')
        return
      }

      if (!confirmPassword.trim()) {
        setError('Please confirm your password.')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long.')
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    try {
      setLoading(true)

      const endpoint = isSignup ? '/auth/register' : '/auth/login'
      const payload = isSignup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password }

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('mindcheck_token', data.token)
      }

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      } else if (isSignup) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: name.trim(),
            email: email.trim(),
          })
        )
      }

      navigate('/home')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-no-nav" style={{ justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          width: '100%',
          maxWidth: 360,
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div className="splash-logo" style={{ margin: '0 auto 14px' }}>
            🧠
          </div>

          <h1 style={{ marginBottom: 8 }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>

          <p>
            {isSignup
              ? 'Start your mental wellness journey with Mind Check.'
              : 'Log in to continue tracking your wellbeing.'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: 22,
          }}
        >
          {isSignup && (
            <div className="input-group">
              <label className="input-label">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder={isSignup ? 'Create a password' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isSignup && (
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                background: '#fff5f5',
                border: '1px solid rgba(224,92,92,0.18)',
              }}
            >
              <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{error}</p>
            </div>
          ) : null}

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading
              ? isSignup
                ? 'Creating account...'
                : 'Logging in...'
              : isSignup
              ? 'Sign Up'
              : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              {isSignup ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}