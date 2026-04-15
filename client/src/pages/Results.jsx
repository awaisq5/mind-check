import { useLocation, useNavigate } from 'react-router-dom'
import ArticleCard from '../components/ArticleCard'

function getMoodScore(mood, energy, stress) {
  const normalizedMood = (mood || '').toLowerCase()

  const moodBase =
    normalizedMood === 'great' ? 9 :
    normalizedMood === 'good' ? 7 :
    normalizedMood === 'okay' ? 5 :
    normalizedMood === 'low' ? 3 : 5

  const energyImpact = (Number(energy) - 5) * 0.35
  const stressImpact = (5 - Number(stress)) * 0.45

  const score = Math.max(1, Math.min(10, Math.round(moodBase + energyImpact + stressImpact)))
  return score
}

function getResultContent({ mood, energy, stress }) {
  const normalizedMood = (mood || '').toLowerCase()
  const score = getMoodScore(mood, energy, stress)

  if (normalizedMood === 'low' || stress >= 8) {
    return {
      score,
      emoji: '💙',
      tone: 'under-pressure',
      accent: '#e05c5c',
      softBg: '#fff4f2',
      border: '1px solid rgba(224,92,92,0.18)',
      message:
        "You seem under pressure today. That's okay, try to slow things down and be kind to yourself.",
      trendLabel: 'Stress is higher than usual',
      suggestions: [
        { emoji: '🌬️', text: 'Take 5 slow breaths and unclench your shoulders' },
        { emoji: '🚶', text: 'Step away for a short walk or stretch break' },
        { emoji: '📝', text: 'Write down one thing that feels manageable today' },
      ],
      articles: [
        {
          id: 'breathing-techniques',
          title: '5 Breathing Techniques to Calm Anxiety',
          category: 'Stress',
          readTime: 4,
        },
      ],
    }
  }

  if (normalizedMood === 'okay' || stress >= 6) {
    return {
      score,
      emoji: '🌤️',
      tone: 'balanced',
      accent: '#f5a623',
      softBg: '#fff9ec',
      border: '1px solid rgba(245,166,35,0.18)',
      message:
        'You may be carrying some tension today. A few small resets can really help.',
      trendLabel: 'A little tension is showing',
      suggestions: [
        { emoji: '💧', text: 'Drink some water and pause for a minute' },
        { emoji: '📵', text: 'Take a short break away from screens' },
        { emoji: '🧠', text: 'Focus only on the next small task, not everything at once' },
      ],
      articles: [
        {
          id: 'healthy-daily-routine',
          title: 'How to Build a Healthy Daily Routine',
          category: 'Habits',
          readTime: 5,
        },
      ],
    }
  }

  if (normalizedMood === 'good' || energy >= 7) {
    return {
      score,
      emoji: '🌱',
      tone: 'good',
      accent: '#4caf87',
      softBg: '#f4fbf7',
      border: '1px solid rgba(76,175,135,0.18)',
      message:
        'You seem to be in a fairly good place today. Keep supporting that momentum with small healthy habits.',
      trendLabel: 'Your energy looks stable',
      suggestions: [
        { emoji: '☀️', text: 'Take a few minutes outside or near natural light' },
        { emoji: '📚', text: 'Protect your energy by keeping your routine steady' },
        { emoji: '🙌', text: 'Notice what is going right today and build on it' },
      ],
      articles: [
        {
          id: 'healthy-daily-routine',
          title: 'How to Build a Healthy Daily Routine',
          category: 'Habits',
          readTime: 5,
        },
      ],
    }
  }

  if (normalizedMood === 'great') {
    return {
      score,
      emoji: '✨',
      tone: 'great',
      accent: '#5b8dee',
      softBg: '#eef4ff',
      border: '1px solid rgba(91,141,238,0.18)',
      message:
        'You seem to be doing really well today. This is a good moment to reinforce the habits that support you.',
      trendLabel: 'Strong positive momentum today',
      suggestions: [
        { emoji: '📸', text: 'Take note of what helped you feel this way today' },
        { emoji: '🎯', text: 'Use this energy for one meaningful task or goal' },
        { emoji: '🤝', text: 'Share some positivity with someone around you' },
      ],
      articles: [
        {
          id: 'understanding-emotions',
          title: 'Understanding Your Emotions Better',
          category: 'Mindfulness',
          readTime: 3,
        },
      ],
    }
  }

  return {
    score,
    emoji: '🌱',
    tone: 'default',
    accent: '#5b8dee',
    softBg: '#eef4ff',
    border: '1px solid rgba(91,141,238,0.18)',
    message: 'Thanks for checking in today.',
    trendLabel: 'No strong pattern yet',
    suggestions: [],
    articles: [],
  }
}

function getTrendBars(score, energy, stress) {
  const base = Number(score) || 5
  const e = Number(energy) || 5
  const s = Number(stress) || 5

  const values = [
    Math.max(28, Math.min(96, base * 8)),
    Math.max(28, Math.min(96, (base - 1 + e * 0.3) * 8)),
    Math.max(28, Math.min(96, (base - 2 + (10 - s) * 0.4) * 8)),
    Math.max(28, Math.min(96, (base - 1 + e * 0.25 - s * 0.1) * 8)),
    Math.max(28, Math.min(96, (base + 0.5) * 8)),
  ]

  return values
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state || {}
  const mood = state.mood || ''
  const energy = Number(state.energy || 0)
  const stress = Number(state.stress || 0)
  const notes = state.notes || ''

  const result = getResultContent({ mood, energy, stress })
  const trendBars = getTrendBars(result.score, energy, stress)

  return (
    <div className="screen-no-nav">
      <div style={{ paddingTop: 18, marginBottom: 20 }}>
        <h1>Today&apos;s Result</h1>
      </div>

      <div
        className="card"
        style={{
          background: result.softBg,
          border: result.border,
          marginBottom: 22,
          padding: 22,
          boxShadow: `0 18px 36px ${result.accent}18`,
        }}
      >
        <div className="row-between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ fontSize: 40 }}>{result.emoji}</div>

          <div
            style={{
              minWidth: 72,
              padding: '10px 14px',
              borderRadius: 18,
              background: '#fff',
              border: `1px solid ${result.accent}22`,
              textAlign: 'center',
              boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-text-muted)',
                marginBottom: 2,
              }}
            >
              Mood score
            </p>
            <p
              style={{
                fontSize: 24,
                lineHeight: 1,
                fontWeight: 800,
                color: result.accent,
              }}
            >
              {result.score}/10
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: 'var(--color-text)',
            fontWeight: 500,
            marginBottom: 18,
          }}
        >
          {result.message}
        </p>

        <div
          className="card"
          style={{
            background: 'rgba(255,255,255,0.72)',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div className="row-between" style={{ marginBottom: 10 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-text-secondary)',
              }}
            >
              Trend snapshot
            </p>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: result.accent,
              }}
            >
              {result.trendLabel}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 62 }}>
            {trendBars.map((value, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${value}%`,
                    borderRadius: '10px 10px 0 0',
                    background:
                      index === trendBars.length - 1
                        ? result.accent
                        : `${result.accent}66`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="result-metrics-row">
          <div className="result-metric-card">
            <p className="result-metric-label">Mood</p>
            <p className="result-metric-value">{mood || '—'}</p>
          </div>

          <div className="result-metric-card">
            <p className="result-metric-label">Energy</p>
            <p className="result-metric-value">{energy || '—'}/10</p>
          </div>

          <div className="result-metric-card">
            <p className="result-metric-label">Stress</p>
            <p className="result-metric-value">{stress || '—'}/10</p>
          </div>
        </div>

        {notes ? (
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 6,
                color: 'var(--color-text-secondary)',
              }}
            >
              Your note
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>{notes}</p>
          </div>
        ) : null}
      </div>

      <div style={{ marginBottom: 24 }}>
        <p className="section-title">Suggestions for you</p>

        {result.suggestions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.suggestions.map((item, index) => (
              <div
                key={index}
                className="card suggestion-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 18,
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: `${result.accent}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {item.emoji}
                </div>

                <p
                  style={{
                    color: 'var(--color-text)',
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.6,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <p>No specific suggestions right now. Keep checking in regularly.</p>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <p className="section-title">Recommended Articles</p>

        {result.articles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.articles.map((article, index) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                category={article.category}
                readTime={article.readTime}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="card">
            <p>No article recommendations for this check-in yet.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/support')}
        >
          Find Support
        </button>

        <div
          className="card"
          style={{
            background: '#fff5f5',
            border: '1px solid rgba(224,92,92,0.16)',
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 6,
            }}
          >
            Emergency help
          </p>
          <p style={{ fontSize: 13 }}>
            If you are in crisis or feel unsafe, contact local emergency services or a crisis helpline immediately.
          </p>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 'auto', marginBottom: 10 }}
        onClick={() => navigate('/home')}
      >
        Done
      </button>
    </div>
  )
}