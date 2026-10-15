import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Banner, Card, ErrorText, Field, Page } from '../components/ui'
import { api, setToken } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate, REGIONS } from '../lib/format'
import { downloadText, remindersIcs } from '../lib/ics'

export default function Settings() {
  const { user, updateSettings, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user.name, region: user.settings.region, reminderTime: user.settings.reminderTime })
  const [msg, setMsg] = useState(null)
  const [error, setError] = useState(null)
  const [password, setPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = async (patch) => {
    setError(null)
    setMsg(null)
    try {
      await updateSettings(patch)
      setMsg('Saved.')
    } catch (err) {
      setError(err)
    }
  }

  const exportData = async () => {
    try {
      const data = await api('/me/export')
      downloadText(`mind-check-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json')
    } catch (err) {
      setError(err)
    }
  }

  const deleteAccount = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await api('/me', { method: 'DELETE', body: { password } })
      setToken(null)
      setUser(null)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err)
    }
  }

  return (
    <Page title="Settings and data" narrow>
      {msg && <Banner tone="ok">{msg}</Banner>}
      <ErrorText error={error} />

      <Card title="Profile">
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault()
            save({ name: form.name, region: form.region })
          }}
        >
          <Field label="Name">
            <input value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Country for crisis and care contacts">
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
              {Object.entries(REGIONS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <button className="btn btn-primary">Save</button>
        </form>
      </Card>

      <Card title="Reminders">
        <p className="muted small">Add two repeating reminders to your phone's calendar: a daily check-in, and the questionnaires every two weeks. No notifications permission needed.</p>
        <div className="row">
          <Field label="Daily reminder at">
            <input type="time" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })} />
          </Field>
          <button
            className="btn btn-ghost"
            onClick={() => {
              save({ reminderTime: form.reminderTime })
              downloadText('mind-check-reminders.ics', remindersIcs({ time: form.reminderTime, appUrl: window.location.origin }), 'text/calendar')
            }}
          >
            Download calendar reminders
          </button>
        </div>
      </Card>

      <Card title="Companion">
        <label className="check">
          <input type="checkbox" checked={user.settings.shareContextWithCompanion} onChange={(e) => save({ shareContextWithCompanion: e.target.checked })} />
          Let the companion see a short summary of my last two weeks (days logged, average mood and sleep). It never sees my notes.
        </label>
      </Card>

      <Card title="Your data">
        <p className="small">
          You agreed to the privacy notice (version {user.consent?.version}) on {formatDate(user.consent?.acceptedAt, { day: 'numeric', month: 'long', year: 'numeric' })}. <Link to="/privacy">Read it again</Link>
        </p>
        <div className="row">
          <button className="btn btn-ghost" onClick={exportData}>
            Download all my data (JSON)
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </Card>

      <Card title="Delete account" tone="danger-soft">
        <p className="small">This permanently deletes your account and every check-in, questionnaire, note, contact and safety plan. It cannot be undone. Download your data first if you want to keep it.</p>
        {confirmDelete ? (
          <form className="row" onSubmit={deleteAccount}>
            <Field label="Confirm with your password">
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <button className="btn btn-danger">Delete everything</button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <button className="btn btn-danger-ghost" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </button>
        )}
      </Card>
    </Page>
  )
}
