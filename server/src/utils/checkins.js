const ARTICLE_LIBRARY = [
  { id: 'a1', title: '5 Breathing Techniques to Calm Anxiety Fast', category: 'Stress', readTime: 4, url: 'https://www.mind.org.uk/' },
  { id: 'a2', title: 'How to Build an Evening Wind-Down Routine', category: 'Sleep', readTime: 5, url: 'https://www.sleepfoundation.org/' },
  { id: 'a3', title: 'Understanding Your Energy Cycles', category: 'Energy', readTime: 6, url: 'https://www.healthline.com/' },
  { id: 'a4', title: 'Simple Mindfulness for Busy Days', category: 'Mindfulness', readTime: 3, url: 'https://www.nhs.uk/every-mind-matters/' },
  { id: 'a5', title: 'Micro-Breaks: The Power of 5 Minutes', category: 'Energy', readTime: 4, url: 'https://www.helpguide.org/' },
  { id: 'a6', title: 'Why Sleep Is the Foundation of Mental Health', category: 'Sleep', readTime: 6, url: 'https://www.nhs.uk/every-mind-matters/' }
]

export function getArticles(category, limit = ARTICLE_LIBRARY.length) {
  const results = category ? ARTICLE_LIBRARY.filter((item) => item.category === category) : ARTICLE_LIBRARY
  return results.slice(0, limit)
}

export function analyzeCheckin({ mood, energy, stress }) {
  if (mood === 'low' || stress >= 8 || energy <= 3) {
    return {
      feedback: {
        text: "You seem under pressure today. That's okay — try to slow things down and be kind to yourself.",
        color: '#e05c5c',
        bg: '#fef2f2',
        emoji: '💙',
      },
      suggestions: [
        { icon: '🌬️', text: 'Take 5 slow breaths and unclench your shoulders' },
        { icon: '🚶', text: 'Step away for a short walk or stretch break' },
        { icon: '📝', text: 'Write down one thing that feels manageable today' },
      ],
      articleCategory: stress >= 8 ? 'Stress' : energy <= 3 ? 'Sleep' : 'Mindfulness',
    }
  }

  if (mood === 'okay' || stress >= 5 || energy <= 5) {
    return {
      feedback: {
        text: 'You are doing fairly okay. A small wellbeing action today could help you stay balanced.',
        color: '#f5a623',
        bg: '#fef9ee',
        emoji: '🌱',
      },
      suggestions: [
        { icon: '☕', text: 'Take a five-minute break away from your screen' },
        { icon: '💧', text: 'Drink water and reset your posture' },
        { icon: '📚', text: 'Read one short article to support your mood today' },
      ],
      articleCategory: 'Mindfulness',
    }
  }

  return {
    feedback: {
      text: 'You are in a good headspace today. Keep supporting the habits that are working for you.',
      color: '#4caf87',
      bg: '#edf7f3',
      emoji: '✨',
    },
    suggestions: [
      { icon: '✅', text: 'Keep your routine steady and notice what is helping' },
      { icon: '🙌', text: 'Celebrate one small win from today' },
      { icon: '🌿', text: 'Protect some calm time for yourself later' },
    ],
    articleCategory: 'Energy',
  }
}

export function calculateScore({ mood, energy, stress }) {
  const moodMap = { good: 85, okay: 60, low: 35 }
  const moodScore = moodMap[mood] || 50
  const energyScore = Number(energy) * 8
  const stressPenalty = (11 - Number(stress)) * 6
  const raw = Math.round((moodScore + energyScore + stressPenalty) / 3)
  return Math.max(10, Math.min(raw, 95))
}

export function buildSummary(checkins) {
  const averageScore = checkins.length ? Math.round(checkins.reduce((sum, item) => sum + item.score, 0) / checkins.length) : 0
  const recent = checkins.slice(-7)
  const week = recent.map((entry) => ({
    label: new Date(entry.createdAt).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
    score: entry.score,
  }))

  const last30 = checkins.slice(-30)
  const lowCount = last30.filter((item) => item.mood === 'low').length
  const highStressCount = last30.filter((item) => item.stress >= 8).length
  const needsSupport = lowCount >= 4 || highStressCount >= 5

  let insight = 'Keep checking in consistently to build clearer wellbeing insights.'
  if (needsSupport) insight = 'Your recent check-ins show repeated low mood or high stress. Extra support may help.'
  else if (averageScore >= 75) insight = 'Your overall pattern looks steady and positive this week.'
  else if (averageScore >= 55) insight = 'Your wellbeing looks mixed. Small daily habits may help stabilize your week.'
  else insight = 'Your mood appears to be under pressure lately. Prioritize rest and support.'

  return {
    totalCheckins: checkins.length,
    averageScore,
    week,
    needsSupport,
    insight,
  }
}

export const SUPPORT_OPTIONS = [
  { id: 's1', emoji: '🤝', title: 'Talk to a trusted friend', desc: 'Share how you are feeling with someone close to you.', bg: '#eef2fd' },
  { id: 's2', emoji: '🧑‍⚕️', title: 'Contact a mental health professional', desc: 'A therapist or counsellor can offer more structured support.', bg: '#edf7f3' },
  { id: 's3', emoji: '📚', title: 'Explore self-help resources', desc: 'Articles, breathing exercises, and wellbeing tools are a good next step.', bg: '#fef9ee' }
]
