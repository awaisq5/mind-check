import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { api } from '../api'

export default function SupportOptions() {
  const navigate = useNavigate()
  const [options, setOptions] = useState([])

  useEffect(() => {
    api.getSupportOptions().then((data) => setOptions(data.options)).catch(() => setOptions([]))
  }, [])

  return (
    <>
      <div className="screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 20px' }}>
          <button onClick={() => navigate(-1)} className="icon-button">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h2>Support Options</h2>
        </div>

        <p style={{ marginBottom: 20, lineHeight: 1.7 }}>You're not alone. Here are some ways to get support when you need it most.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {options.map((opt) => (
            <div key={opt.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div className="support-box" style={{ background: opt.bg }}>
                {opt.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)', marginBottom: 5 }}>{opt.title}</p>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20, background: '#fef2f2', border: '1px solid #fca5a530', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600, marginBottom: 6 }}>🆘 In an emergency?</p>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>Call emergency services or a crisis line immediately. You matter.</p>
        </div>
      </div>
      <BottomNav />
    </>
  )
}
