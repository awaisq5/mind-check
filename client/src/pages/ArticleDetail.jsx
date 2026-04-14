import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { ARTICLES } from './Articles'

export default function ArticleDetail() {
  const navigate = useNavigate()
  const { id } = useParams()

  const article = useMemo(() => ARTICLES.find((item) => item.id === id), [id])

  if (!article) {
    return (
      <>
        <div className="screen">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 20px' }}>
            <button
              onClick={() => navigate('/articles')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 8,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-text)"
                strokeWidth="2.5"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h2>Article Not Found</h2>
          </div>

          <p style={{ lineHeight: 1.7 }}>
            The article you are looking for could not be found.
          </p>
        </div>

        <BottomNav />
      </>
    )
  }

  return (
    <>
      <div className="screen">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 20px' }}>
          <button
            onClick={() => navigate('/articles')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 8,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text)"
              strokeWidth="2.5"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>Article</h2>
        </div>

        <div className="card">
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 12,
              lineHeight: 1.4,
            }}
          >
            {article.title}
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-light)',
                padding: '4px 10px',
                borderRadius: 20,
              }}
            >
              {article.category}
            </span>

            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {article.readTime} min read
            </span>
          </div>

          <div style={{ whiteSpace: 'pre-line', marginBottom: 20 }}>
            <p style={{ lineHeight: 1.9 }}>{article.content}</p>
          </div>

          <div className="card" style={{ background: 'var(--color-primary-light)', border: 'none' }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text)',
                marginBottom: 8,
              }}
            >
              Want to explore more?
            </p>

            <p style={{ marginBottom: 12, lineHeight: 1.7 }}>
              Read the full article from an external source for more guidance and detail.
            </p>

            <button
              className="btn btn-primary"
              onClick={() => window.open(article.sourceUrl, '_blank', 'noopener,noreferrer')}
            >
              Read on website
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  )
}