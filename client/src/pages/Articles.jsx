import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'

const ARTICLES = [
  {
    title: '5 Breathing Techniques to Calm Anxiety',
    category: 'Stress',
    readTime: 4,
  },
  {
    title: 'Why Sleep Is the Foundation of Mental Health',
    category: 'Sleep',
    readTime: 6,
  },
  {
    title: 'How to Build a Healthy Daily Routine',
    category: 'Habits',
    readTime: 5,
  },
  {
    title: 'Understanding Your Emotions Better',
    category: 'Mindfulness',
    readTime: 3,
  },
]

export default function Articles() {
  const navigate = useNavigate()

  return (
    <>
      <div className="screen">
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0 20px' }}>
          <button
            onClick={() => navigate(-1)}
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

          <h2>Articles</h2>
        </div>

        {/* DESCRIPTION */}
        <p style={{ marginBottom: 20, lineHeight: 1.7 }}>
          Explore helpful articles to improve your mental wellbeing and daily habits.
        </p>

        {/* ARTICLES LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ARTICLES.map((article, i) => (
            <ArticleCard
              key={i}
              title={article.title}
              category={article.category}
              readTime={article.readTime}
              index={i}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  )
}