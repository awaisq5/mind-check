import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'
import ChatbotPanel from '../components/ChatbotPanel'
import { apiFetch } from '../lib/api'

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

  useEffect(() => {
    let active = true

    apiFetch('/chat/status')
      .then((data) => {
        if (active && data.shouldTriggerChatbot) {
          setShowChatPrompt(true)
        }
      })
      .catch(() => {})

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

  return (
    <>
      <div className="screen">
        <div
          style={{
            paddingTop: 20,
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              Hi, Awais 👋
            </p>
            <h1>How are you feeling today?</h1>
          </div>

          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ width: 'auto', padding: '10px 14px', flexShrink: 0 }}
          >
            Logout
          </button>
        </div>

        {showChatPrompt && (
          <div
            className="card"
            style={{
              background: '#fef9ee',
              border: '1px solid #f5a62330',
              marginBottom: 20,
            }}
          >
            <p style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 6 }}>
              I noticed you’ve been feeling low lately.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
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

        <div className="card" style={{ background: 'var(--color-primary-light)', border: 'none', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 14 }}>
              This week&apos;s mood
            </p>
            <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>5 check-ins</span>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 40 }}>
            {[60, 75, 55, 85, 70].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: 'var(--color-primary)',
                  borderRadius: '4px 4px 0 0',
                  opacity: i === 4 ? 1 : 0.5,
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {['M', 'T', 'W', 'T', 'F'].map((d, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 10,
                  color: 'var(--color-primary)',
                  fontWeight: i === 4 ? 700 : 400,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
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
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View all
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      <ChatbotPanel open={showChat} onClose={() => setShowChat(false)} />
      <BottomNav />
    </>
  )
}