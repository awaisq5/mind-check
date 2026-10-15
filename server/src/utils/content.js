// Static content served by the API: the article library and support options.

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

export const SUPPORT_OPTIONS = [
  { id: 's1', emoji: '🤝', title: 'Talk to a trusted friend', desc: 'Share how you are feeling with someone close to you.', bg: '#eef2fd' },
  { id: 's2', emoji: '🧑‍⚕️', title: 'Contact a mental health professional', desc: 'A therapist or counsellor can offer more structured support.', bg: '#edf7f3' },
  { id: 's3', emoji: '📚', title: 'Explore self-help resources', desc: 'Articles, breathing exercises, and wellbeing tools are a good next step.', bg: '#fef9ee' }
]
