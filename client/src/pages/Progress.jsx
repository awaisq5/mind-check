import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { apiFetch } from '../lib/api'
import {
  averageScore,
  buildInsight,
  buildSVGPoints,
  buildSummaryStats,
  buildTrendData,
} from '../lib/checkinInsights'

export default function Progress() {
  const navigate = useNavigate()
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    apiFetch('/checkins')
      .then((data) => {
        if (Array.isArray(data)) {
          setCheckins(data)
        }
      })
      .catch(() => {})
  }, [])

  const trendData = useMemo(() => buildTrendData(checkins), [checkins])
  const points = useMemo(() => buildSVGPoints(trendData, 320, 140), [trendData])
  const stats = useMemo(() => buildSummaryStats(checkins), [checkins])
  const insight = useMemo(() => buildInsight(checkins), [checkins])

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
            <p style={{ marginTop: 2 }}>A clearer view of your recent mood pattern.</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 18, padding: 18 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <p className="summary-title">Mood Trend</p>
            <span className="score-pill">{averageScore(checkins) || '0.0'}/10</span>
          </div>

          {trendData.length > 0 ? (
            <>
              <div className="trend-chart-wrap">
                <svg viewBox="0 0 320 140" className="trend-chart-svg">
                  {[20, 50, 80, 110].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="320"
                      y2={y}
                      stroke="rgba(15,23,42,0.06)"
                      strokeWidth="1"
                    />
                  ))}

                  <polyline
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />

                  {trendData.map((item, index) => {
                    const x =
                      trendData.length === 1
                        ? 160
                        : 12 + ((320 - 24) * index) / (trendData.length - 1)

                    const y = 14 + (140 - 28) - ((item.score / 10) * (140 - 28))

                    return (
                      <g key={item._id || index}>
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#ffffff"
                          stroke="var(--color-primary)"
                          strokeWidth="3"
                        />
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className="trend-label-row">
                {trendData.map((item, index) => (
                  <div key={item._id || index} className="trend-label-item">
                    <span className="trend-label-day">{item.shortDay}</span>
                    <span className="trend-label-date">{item.shortDate}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No trend data yet. Complete a few check-ins to see your graph.</p>
          )}
        </div>

        <div className="result-metrics-row" style={{ marginBottom: 18 }}>
          <div className="result-metric-card">
            <p className="result-metric-label">Avg Score</p>
            <p className="result-metric-value">{stats.averageMoodScore}</p>
          </div>

          <div className="result-metric-card">
            <p className="result-metric-label">Energy (Latest)</p>
            <p className="result-metric-value">{stats.latestEnergy}</p>
          </div>

          <div className="result-metric-card">
            <p className="result-metric-label">Stress (Latest)</p>
            <p className="result-metric-value">{stats.latestStress}</p>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Check-ins Logged</p>
            <span className="tiny-muted">{stats.totalCheckins}</span>
          </div>
          <p>You are building a stronger picture of your wellbeing over time.</p>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Insight</p>
            <span className="tiny-muted">Live pattern</span>
          </div>
          <p>{insight}</p>
        </div>
      </div>

      <BottomNav />
    </>
  )
}