import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { api } from '../api'

export default function Progress() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.getSummary().then(setSummary).catch(() => setSummary(null))
  }, [])

  const week = summary?.week || [
    { label: 'M', score: 55 },
    { label: 'T', score: 65 },
    { label: 'W', score: 48 },
    { label: 'T', score: 72 },
    { label: 'F', score: 66 },
  ]

  const avg = summary?.averageScore || Math.round(week.reduce((sum, item) => sum + item.score, 0) / week.length)

  return (
    <>
      <div className="screen">
        <div style={{ paddingTop: 20, marginBottom: 20 }}>
          <h2>Your Progress</h2>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text)' }}>Mood this week</p>
            <span style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>Avg {avg}%</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
            {week.map((item, i) => (
              <div key={`${item.label}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: `${item.score}%`, background: item.score === Math.max(...week.map((entry) => entry.score)) ? 'var(--color-primary)' : 'var(--color-primary-light)', borderRadius: '4px 4px 0 0', border: `1px solid ${item.score === Math.max(...week.map((entry) => entry.score)) ? 'var(--color-primary)' : 'var(--color-border)'}` }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {week.map((item, i) => (
              <span key={`${item.label}-label-${i}`} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: item.score === Math.max(...week.map((entry) => entry.score)) ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: item.score === Math.max(...week.map((entry) => entry.score)) ? 700 : 400 }}>{item.label}</span>
            ))}
          </div>
        </div>

        <div className="card summary-card">
          <div className="emoji-box">📅</div>
          <div>
            <p className="summary-title">Weekly Summary</p>
            <p style={{ fontSize: 13 }}>You checked in {summary?.totalCheckins || 0} times in total</p>
          </div>
        </div>

        <div className="card summary-card" style={{ marginBottom: 20 }}>
          <div className="emoji-box" style={{ background: '#fef9ee' }}>📊</div>
          <div>
            <p className="summary-title">Monthly Insight</p>
            <p style={{ fontSize: 13 }}>{summary?.insight || 'Keep checking in consistently to build your pattern insights.'}</p>
          </div>
        </div>

        {summary?.needsSupport && (
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fca5a520', cursor: 'pointer' }} onClick={() => navigate('/support-alert')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>💙</span>
              <div style={{ flex: 1 }}>
                <p className="summary-title">Need extra support?</p>
                <p style={{ fontSize: 13 }}>View support options →</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </>
  )
}
