import { useParams, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const CONTENT = {
  breathing: {
    title: '5 Breathing Techniques to Calm Anxiety',
    body: 'Try slow breathing, box breathing, and mindful pauses. Focus on your inhale and exhale to calm your nervous system.',
  },
  sleep: {
    title: 'Why Sleep Is the Foundation of Mental Health',
    body: 'Sleep affects mood, focus, and emotional balance. Aim for consistent sleep patterns and reduce screen time before bed.',
  },
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const article = CONTENT[id]

  if (!article) {
    return (
      <div className="screen">
        <h2>Article not found</h2>
      </div>
    )
  }

  return (
    <>
      <div className="screen">
        <button onClick={() => navigate(-1)} className="btn btn-ghost">
          Back
        </button>

        <h2 style={{ marginTop: 16 }}>{article.title}</h2>

        <p style={{ marginTop: 12, lineHeight: 1.7 }}>
          {article.body}
        </p>
      </div>

      <BottomNav />
    </>
  )
}