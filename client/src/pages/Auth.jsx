import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand, HelpNowLink } from '../components/Layout'
import { ErrorText, Field } from '../components/ui'
import { useAuth } from '../lib/auth'

function Shell({ title, children, footer }) {
  return (
    <div className="auth">
      <header className="landing-top">
        <Link to="/" className="brand-link">
          <Brand />
        </Link>
        <HelpNowLink />
      </header>
      <main className="auth-card">
        <h1>{title}</h1>
        {children}
        <p className="auth-foot">{footer}</p>
      </main>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(form.email, form.password)
      navigate('/today')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell
      title="Welcome back"
      footer={
        <>
          New here? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} className="stack">
        <Field label="Email">
          <input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password">
          <input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <ErrorText error={error} />
        <button className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </Shell>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', consent: false })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await register(form)
      navigate('/today')
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Shell
      title="Create your account"
      footer={
        <>
          Already registered? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} className="stack">
        <Field label="First name or nickname">
          <input autoComplete="given-name" required maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email">
          <input type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Password" hint="At least 10 characters.">
          <input type="password" autoComplete="new-password" required minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <label className="consent">
          <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} required />
          <span>
            I agree that Mind Check stores the health information I enter (mood, sleep, questionnaire answers and notes) to provide this service, as described in the <Link to="/privacy">privacy notice</Link>. I can withdraw at any time by deleting my account.
          </span>
        </label>
        <ErrorText error={error} />
        <button className="btn btn-primary btn-lg" disabled={busy || !form.consent}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted small">Mind Check is not a medical device and does not replace professional care.</p>
      </form>
    </Shell>
  )
}
