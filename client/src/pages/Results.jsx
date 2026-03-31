import { useNavigate, useLocation } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'

export default function Results() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const feedback = state?.feedback
  const suggestions = state?.suggestions || []
  const articles = state?.articles || []

  return (
    <div className="screen-no-nav">
      <div style={{ padding: '20px 0 24px' }}>
        <h1>Today's Result</h1>
      </div>

      <div className="card" style={{ background: feedback?.bg || '#eef2fd', border: `1px solid ${(feedback?.color || '#5b8dee')}20`, marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>{feedback?.emoji || '🌱'}</div>
        <p style={{ fontSize: 15, color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.6 }}>
          {feedback?.text || 'Thanks for checking in today.'}
        </p>
      </div>

      <p className="section-title">Suggestions for you</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {suggestions.map((item, i) => (
          <div key={`${item.text}-${i}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <p style={{ color: 'var(--color-text)', fontSize: 14, fontWeight: 500 }}>{item.text}</p>
          </div>
        ))}
      </div>

      <p className="section-title">Recommended Articles</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {articles.map((article, index) => <ArticleCard key={article.id} {...article} index={index} />)}
      </div>

      <button className="btn btn-primary" onClick={() => navigate('/home')}>Done</button>
      <div style={{ height: 16 }} />
    </div>
  )
}
