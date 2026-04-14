import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'

const ARTICLES = [
  {
    id: 'breathing',
    title: '5 Breathing Techniques to Calm Anxiety',
    category: 'Stress',
    readTime: 4,
  },
  {
    id: 'sleep',
    title: 'Why Sleep Is the Foundation of Mental Health',
    category: 'Sleep',
    readTime: 6,
  },
]

export default function Articles() {
  const navigate = useNavigate()

  return (
    <>
      <div className="screen">
        <h2 style={{ marginBottom: 20 }}>Articles</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ARTICLES.map((a, i) => (
            <ArticleCard
              key={a.id}
              {...a}
              index={i}
              to={`/articles/${a.id}`}   // ✅ IMPORTANT
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  )
}