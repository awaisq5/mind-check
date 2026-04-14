import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ArticleCard from '../components/ArticleCard'

export const ARTICLES = [
  {
    id: 'breathing-techniques',
    title: '5 Breathing Techniques to Calm Anxiety',
    category: 'Stress',
    readTime: 4,
    content: `
Breathing techniques can help calm your mind and body during stressful moments.

1. Box breathing:
Inhale for 4 seconds, hold for 4, exhale for 4, hold for 4.

2. 4-6 breathing:
Inhale for 4 seconds and exhale slowly for 6 seconds.

3. Deep belly breathing:
Place one hand on your belly and breathe deeply so your stomach rises.

4. Counted breathing:
Focus only on your breath and count each inhale and exhale.

5. Pause breathing:
Take 3 slow breaths before reacting to stress.

These exercises can help lower tension and bring your attention back to the present moment.
    `.trim(),
  },
  {
    id: 'sleep-foundation',
    title: 'Why Sleep Is the Foundation of Mental Health',
    category: 'Sleep',
    readTime: 6,
    content: `
Sleep plays a major role in emotional balance, focus, and stress recovery.

When you do not sleep well:
- your mood becomes more fragile
- stress feels heavier
- concentration becomes harder
- emotional reactions feel stronger

To improve sleep:
- go to bed at the same time daily
- reduce screen time before sleep
- avoid caffeine late in the day
- keep your room cool and dark
- create a relaxing evening routine

Good sleep supports both mental and physical wellbeing.
    `.trim(),
  },
  {
    id: 'healthy-daily-routine',
    title: 'How to Build a Healthy Daily Routine',
    category: 'Habits',
    readTime: 5,
    content: `
A healthy routine creates structure and reduces mental overload.

Start small:
- wake up at a regular time
- drink water in the morning
- plan 2–3 key tasks
- take short breaks during the day
- include movement, even a short walk
- wind down at night with a simple routine

You do not need a perfect routine.
A simple and repeatable structure is often more helpful than an ideal one.
    `.trim(),
  },
  {
    id: 'understanding-emotions',
    title: 'Understanding Your Emotions Better',
    category: 'Mindfulness',
    readTime: 3,
    content: `
Understanding your emotions starts with noticing them without judgment.

Try asking yourself:
- What am I feeling right now?
- What triggered this feeling?
- What do I need in this moment?
- Is this emotion asking for rest, support, or space?

Naming emotions can reduce their intensity.
Instead of saying "I feel bad," try:
- I feel anxious
- I feel lonely
- I feel overwhelmed
- I feel disappointed

Clarity creates calm.
    `.trim(),
  },
]

export default function Articles() {
  const navigate = useNavigate()

  return (
    <>
      <div className="screen">
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

        <p style={{ marginBottom: 20, lineHeight: 1.7 }}>
          Explore helpful articles to improve your mental wellbeing and daily habits.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ARTICLES.map((article, i) => (
            <ArticleCard
              key={article.id}
              id={article.id}
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