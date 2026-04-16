import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'
import ChatbotPanel from '../components/ChatbotPanel'
import { apiFetch } from '../lib/api'
import {
  buildInsight,
  buildTrendData,
  buildSummaryStats,
} from '../lib/checkinInsights'

const HOME_ARTICLES = [
  {
    id: 'breathing-techniques',
    title: '5 Breathing Techniques to Calm Anxiety',
    category: 'Stress',
    readTime: 4,
  },
  {
    id: 'sleep-foundation',
    title: 'Why Sleep Is the Foundation of Mental Health',
    category: 'Sleep',
    readTime: 6,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const [showChatPrompt, setShowChatPrompt] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [checkins, setCheckins] = useState([])

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let active = true

    Promise.allSettled([apiFetch('/chat/status'), apiFetch('/checkins')]).then(
      ([chatResult, checkinResult]) => {
        if (!active) return

        if (
          chatResult.status === 'fulfilled' &&
          chatResult.value?.shouldTriggerChatbot
        ) {
          setShowChatPrompt(true)
        }

        if (checkinResult.status === 'fulfilled' && Array.isArray(checkinResult.value)) {
          setCheckins(checkinResult.value)
        }
      }
    )

    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('mindcheck_token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const trendData = buildTrendData(checkins)
  const stats = buildSummaryStats(checkins)
  const insight = buildInsight(checkins)

  return (
    <>
      <div className="screen">
        <div
          style={{
            paddingTop: 18,
            marginBottom: 22,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 18,
                color: 'var(--color-text-secondary)',
                marginBottom: 8,
                fontWeight: 800,
              }}
            >
              Hi, {user?.name || 'there'} 👋
            </p>
            <h1>
              How are you feeling
              <br />
              today?
            </h1>
          </div>

          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{
              width: 'auto',
              padding: '12px 16px',
              flexShrink: 0,
              borderRadius: 18,
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        </div>

        {showChatPrompt && (
          <div
            className="card"
            style={{
              background: '#fff8eb',
              border: '1px solid rgba(245,166,35,0.18)',
              marginBottom: 18,
              boxShadow: '0 14px 28px rgba(245,166,35,0.10)',
            }}
          >
            <p style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              I noticed you&apos;ve been feeling low lately.
            </p>
            <p style={{ marginBottom: 12 }}>
              Want to talk for a moment with the support assistant?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => setShowChat(true)}>
                Open chat
              </button>

              <button className="btn btn-ghost" onClick={() => setShowChatPrompt(false)}>
                Later
              </button>
            </div>
          </div>
        )}

        <div className="quick-actions" style={{ marginBottom: 18 }}>
          <button className="btn btn-primary" onClick={() => navigate('/checkin')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Start Check-In
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/progress')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            View Progress
          </button>
        </div>

        <div className="card hero-card" style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 15 }}>This week&apos;s mood</p>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {stats.totalCheckins} check-ins
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 54 }}>
            {(trendData.length ? trendData : [{ score: 4 }, { score: 5 }, { score: 4 }, { score: 6 }, { score: 5 }]).map((item, i, arr) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${Math.max(26, item.score * 10)}%`,
                  background: i === arr.length - 1 ? '#ffffff' : 'rgba(255,255,255,0.68)',
                  borderRadius: '8px 8px 0 0',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {(trendData.length ? trendData : ['M', 'T', 'W', 'T', 'F'].map((d) => ({ shortDay: d }))).map((item, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: i === (trendData.length || 5) - 1 ? 800 : 600,
                }}
              >
                {item.shortDay}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 22 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <p className="summary-title">Quick insight</p>
            <span className="tiny-muted">Live data</span>
          </div>
          <p>{insight}</p>
        </div>

        <div className="soft-section" style={{ marginBottom: 22 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <p className="section-title" style={{ marginBottom: 0 }}>
              Recommended Articles
            </p>

            <button
              onClick={() => navigate('/articles')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View all
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HOME_ARTICLES.map((a, i) => (
              <ArticleCard
                key={a.id}
                id={a.id}
                title={a.title}
                category={a.category}
                readTime={a.readTime}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>

      <ChatbotPanel open={showChat} onClose={() => setShowChat(false)} />
      <BottomNav />
    </>
  )
}