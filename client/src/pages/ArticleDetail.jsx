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
              onClick={() => navigate('/articles')}
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
            <h2>Article Not Found</h2>
          </div>

          <div className="card">
            <p>The article you are looking for could not be found.</p>
          </div>
        </div>

        <BottomNav />
      </>
    )
  }

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
            onClick={() => navigate('/articles')}
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
          <h2>Article</h2>
        </div>

        <div
          className="card"
          style={{
            marginBottom: 18,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.86) 100%)',
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text)',
              marginBottom: 14,
              lineHeight: 1.25,
              letterSpacing: '-0.03em',
            }}
          >
            {article.title}
          </p>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-light)',
                padding: '5px 10px',
                borderRadius: 999,
              }}
            >
              {article.category}
            </span>

            <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {article.readTime} min read
            </span>
          </div>

          <div style={{ whiteSpace: 'pre-line', marginBottom: 20 }}>
            <p style={{ lineHeight: 1.95, fontSize: 15 }}>{article.content}</p>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #f5f8ff 0%, #edf4ff 100%)',
              border: '1px solid rgba(91,141,238,0.12)',
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: 8,
              }}
            >
              Want to explore more?
            </p>

            <p style={{ marginBottom: 12 }}>
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