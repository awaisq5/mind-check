import { useNavigate } from 'react-router-dom'

export default function Splash() {
  const navigate = useNavigate()

  return (
    <div className="screen-no-nav" style={{ justifyContent: 'space-between' }}>
      <div className="blob" />

      <div className="splash-center">
        <div className="splash-logo">🧘</div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.5px' }}>Mind Check</h1>
        <p style={{ fontSize: 16, maxWidth: 260, lineHeight: 1.7 }}>
          A daily wellbeing app that helps you track mood, get support, and build small self-care habits.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Get Started
        </button>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
          Your mental health, your journey.
        </p>
      </div>
    </div>
  )
}
