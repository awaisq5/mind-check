import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { apiFetch } from '../lib/api'

export default function CheckIn() {
  const navigate = useNavigate()
  const [mood, setMood] = useState('')
  const [energy, setEnergy] = useState(5)
  const [stress, setStress] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!mood) {
      alert('Please select your mood.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        mood: mood.toLowerCase(),
        energy,
        stress,
        notes,
      }

      const savedCheckin = await apiFetch('/checkins', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      navigate('/results', {
        state: {
          savedCheckin,
        },
      })
    } catch (error) {
      alert(error.message || 'Failed to save check-in.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="screen">
        <div
          style={{
            paddingTop: 18,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="icon-button"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(15,23,42,0.06)',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text)"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h2>Daily Check-In</h2>
            <p style={{ marginTop: 2 }}>Take a minute to reflect on how you feel.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>
              How would you describe your mood?
            </p>

            <div className="chip-row">
              {['Great', 'Good', 'Okay', 'Low'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`chip ${mood === item ? 'active' : ''}`}
                  onClick={() => setMood(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Energy</p>
              <span className="score-pill">{energy}/10</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
          </div>

          <div className="card">
            <div className="row-between" style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 700, color: 'var(--color-text)' }}>Stress</p>
              <span className="score-pill">{stress}/10</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
            />
          </div>

          <div className="card">
            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                rows="4"
                placeholder="What’s on your mind today?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Check-In'}
          </button>
        </form>
      </div>

      <BottomNav />
    </>
  )
}