import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'
import { api } from '../api'
import { clearAuth, getStoredUser } from '../auth'

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser())
  const [summary, setSummary] = useState(null)
  const [articles, setArticles] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, summaryData, articleData] = await Promise.all([
          api.me(),
          api.getSummary(),
          api.getArticles('limit=2'),
        ])
        setUser(profile.user)
        setSummary(summaryData)
        setArticles(articleData.articles)
      } catch (err) {
        setError(err.message)
      }
    }
    loadData()
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const bars = summary?.week?.map((item) => item.score) || [45, 55, 65, 60, 70]
  const labels = summary?.week?.map((item) => item.label) || ['M', 'T', 'W', 'T', 'F']

  return (
    <>
      <div className="screen">
        <div style={{ paddingTop: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
            <div>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Hi, {user?.name || 'there'} 👋</p>
              <h1>How are you feeling today?</h1>
            </div>
            <button className="chip" onClick={handleLogout}>Logout</button>
          </div>
          {error && <p style={{ color: 'var(--color-danger)', marginTop: 10 }}>{error}</p>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          <button className="btn btn-primary" onClick={() => navigate('/checkin')}>
            Start Check-In
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/progress')}>
            View Progress
          </button>
        </div>

        <div className="card" style={{ background: 'var(--color-primary-light)', border: 'none', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 14 }}>This week's mood</p>
            <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>{summary?.totalCheckins || 0} check-ins</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 52 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${Math.max(h, 16)}%`, background: 'var(--color-primary)', borderRadius: '4px 4px 0 0', opacity: i === bars.length - 1 ? 1 : 0.5 }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            {labels.map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--color-primary)', fontWeight: i === labels.length - 1 ? 700 : 400 }}>{d}</span>
            ))}
          </div>
        </div>

        <p className="section-title">Recommended Articles</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {articles.map((article, index) => <ArticleCard key={article.id} {...article} index={index} />)}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
