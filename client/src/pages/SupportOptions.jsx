import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import NearbySupport from '../components/NearbySupport'

const OPTIONS = [
  {
    emoji: '🤝',
    title: 'Talk to a trusted friend',
    desc: "Share how you're feeling with someone close to you.",
    bg: 'var(--color-primary-light)',
  },
  {
    emoji: '🧑‍⚕️',
    title: 'Contact a mental health professional',
    desc: 'A therapist or counsellor can offer expert guidance.',
    bg: 'var(--color-success-light)',
  },
  {
    emoji: '📚',
    title: 'Explore self-help resources',
    desc: 'Articles, exercises, and tools you can use anytime.',
    bg: '#fef9ee',
  },
]

export default function SupportOptions() {
  const navigate = useNavigate()

  return (
    <>
      <div className="screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 8 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text)" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>Support Options</h2>
        </div>

        <p style={{ marginBottom: 20, lineHeight: 1.7 }}>
          You&apos;re not alone. Here are some ways to get support when you need it most.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {OPTIONS.map((opt, i) => (
            <div key={i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: opt.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {opt.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text)', marginBottom: 5 }}>
                  {opt.title}
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.6 }}>{opt.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <NearbySupport />

        <div
          className="card"
          style={{
            marginTop: 20,
            background: '#fef2f2',
            border: '1px solid #fca5a530',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600, marginBottom: 6 }}>
            🆘 In an emergency?
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            Call emergency services or a crisis line immediately. This app is not emergency care.
          </p>
        </div>
      </div>

      <BottomNav />
    </>
  )
}