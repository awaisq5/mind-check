import { useNavigate } from 'react-router-dom'

export default function SupportAlert() {
  const navigate = useNavigate()

  return (
    <div className="screen-no-nav" style={{ justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="support-icon">💙</div>

        <div style={{ maxWidth: 300 }}>
          <h2 style={{ marginBottom: 12, lineHeight: 1.3 }}>We noticed you've been feeling low for a while</h2>
          <p style={{ lineHeight: 1.7, fontSize: 15 }}>
            It may help to explore extra support or talk to someone you trust.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={() => navigate('/support')}>Find Support</button>
          <button className="btn btn-ghost" onClick={() => navigate('/home')}>Maybe Later</button>
        </div>

        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 260, lineHeight: 1.6 }}>
          If you're in crisis, please call your local emergency services or a crisis helpline immediately.
        </p>
      </div>
    </div>
  )
}
