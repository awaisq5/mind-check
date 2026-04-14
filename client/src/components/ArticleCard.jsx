import { useNavigate } from 'react-router-dom'

const ARTICLE_COLORS = ['#e8f4fd', '#fef3e8', '#edf7f3', '#f3f0fd']
const ARTICLE_TEXT = ['#2980b9', '#e67e22', '#27ae60', '#7f5af0']

export default function ArticleCard({
  title,
  category,
  readTime,
  index = 0,
  to,
}) {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    }
  }

  const bg = ARTICLE_COLORS[index % ARTICLE_COLORS.length]
  const text = ARTICLE_TEXT[index % ARTICLE_TEXT.length]

  return (
    <div
      className="card"
      onClick={handleClick}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        cursor: to ? 'pointer' : 'default',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 22,
        }}
      >
        {index % 4 === 0 ? '🧠' : index % 4 === 1 ? '🌿' : index % 4 === 2 ? '💤' : '✨'}
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 4,
          }}
        >
          {title}
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: text,
              background: bg,
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            {category}
          </span>

          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
            {readTime} min read
          </span>
        </div>
      </div>
    </div>
  )
}