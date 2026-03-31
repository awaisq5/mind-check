import { useEffect, useMemo, useState } from 'react'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'
import { api } from '../api'

const FILTERS = ['All', 'Stress', 'Energy', 'Sleep', 'Mindfulness']

export default function Articles() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [articles, setArticles] = useState([])

  useEffect(() => {
    api.getArticles().then((data) => setArticles(data.articles)).catch(() => setArticles([]))
  }, [])

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchCategory = filter === 'All' || article.category === filter
      const matchQuery = article.title.toLowerCase().includes(query.toLowerCase())
      return matchCategory && matchQuery
    })
  }, [articles, filter, query])

  return (
    <>
      <div className="screen">
        <div style={{ paddingTop: 20, marginBottom: 16 }}>
          <h2>Recommended Articles</h2>
        </div>

        <div style={{ position: 'relative', marginBottom: 14 }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search articles" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 42 }} />
        </div>

        <div className="chip-row" style={{ marginBottom: 20 }}>
          {FILTERS.map((item) => (
            <button key={item} className={`chip ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length > 0 ? filtered.map((article, index) => <ArticleCard key={article.id} {...article} index={index} />) : <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px 0' }}>No articles found.</p>}
        </div>
      </div>
      <BottomNav />
    </>
  )
}
