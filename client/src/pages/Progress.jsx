import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

export default function Progress() {
  const navigate = useNavigate()

  const weeklyData = [55, 68, 72, 60, 82, 74, 88]

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
            <h2>Progress</h2>
            <p style={{ marginTop: 2 }}>A quick look at your recent wellbeing.</p>
          </div>
        </div>

        <div
          className="card hero-card"
          style={{ marginBottom: 18 }}
        >
          <div className="row-between" style={{ marginBottom: 14 }}>
            <p style={{ fontWeight: 700, color: '#fff' }}>Weekly Mood Trend</p>
            <span className="score-pill" style={{ color: '#fff' }}>+12%</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 110 }}>
            {weeklyData.map((value, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${value}%`,
                    background: index === weeklyData.length - 1 ? '#ffffff' : 'rgba(255,255,255,0.72)',
                    borderRadius: '12px 12px 0 0',
                  }}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.95)', fontWeight: 700 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Average Mood Score</p>
            <span className="score-pill">7.8/10</span>
          </div>
          <p>You’ve shown a steadier mood pattern this week compared to the last one.</p>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Best Day</p>
            <span className="tiny-muted">Friday</span>
          </div>
          <p>Your highest mood was recorded on Friday, possibly after more rest and recovery.</p>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Insight</p>
            <span className="tiny-muted">Pattern</span>
          </div>
          <p>You tend to feel better on days when you complete a check-in earlier.</p>
        </div>
      </div>

      <BottomNav />
    </>
  )
}