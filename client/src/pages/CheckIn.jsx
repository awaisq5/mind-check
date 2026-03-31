import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

const MOODS = [
  { label: 'Good', emoji: '🙂', value: 'good' },
  { label: 'Okay', emoji: '😐', value: 'okay' },
  { label: 'Low', emoji: '😞', value: 'low' },
]

export default function CheckIn() {
  const navigate = useNavigate()
  const [mood, setMood] = useState(null)
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const result = await api.createCheckin({ mood, energy: Number(energy), stress: Number(stress), notes })
      navigate('/results', { state: result })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen-no-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0 24px' }}>
        <button onClick={() => navigate('/home')} className="icon-button">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <h2>Daily Check-In</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
        <div>
          <label className="input-label" style={{ display: 'block', marginBottom: 12 }}>Mood</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => setMood(m.value)} className={`mood-btn ${mood === m.value ? 'mood-active' : ''}`}>
                <span style={{ fontSize: 26 }}>{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <label className="input-label">Energy</label>
            <span className="score-pill">{energy}/10</span>
          </div>
          <input type="range" min="1" max="10" step="1" value={energy} onChange={(e) => setEnergy(e.target.value)} />
          <div className="row-between mt-4">
            <span className="tiny-muted">Drained</span>
            <span className="tiny-muted">Energized</span>
          </div>
        </div>

        <div>
          <div className="row-between" style={{ marginBottom: 10 }}>
            <label className="input-label">Stress</label>
            <span className="score-pill">{stress}/10</span>
          </div>
          <input type="range" min="1" max="10" step="1" value={stress} onChange={(e) => setStress(e.target.value)} />
          <div className="row-between mt-4">
            <span className="tiny-muted">Calm</span>
            <span className="tiny-muted">Overwhelmed</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Notes <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span></label>
          <textarea placeholder="What's on your mind today?" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      </div>

      <div style={{ paddingTop: 20, paddingBottom: 16 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!mood || loading} style={{ opacity: !mood || loading ? 0.6 : 1 }}>
          {loading ? 'Saving...' : 'Submit Check-In'}
        </button>
        {!mood && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Select a mood to continue</p>}
      </div>
    </div>
  )
}
