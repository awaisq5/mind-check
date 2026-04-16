export function moodToScore(mood) {
  const value = (mood || '').toLowerCase()

  if (value === 'great') return 9
  if (value === 'good') return 7
  if (value === 'okay') return 5
  if (value === 'low') return 3

  return 5
}

export function calculateCheckinScore(checkin) {
  const moodBase = moodToScore(checkin?.mood)
  const energy = Number(checkin?.energy || 5)
  const stress = Number(checkin?.stress || 5)

  const energyImpact = (energy - 5) * 0.35
  const stressImpact = (5 - stress) * 0.45

  return Math.max(1, Math.min(10, Math.round(moodBase + energyImpact + stressImpact)))
}

export function formatShortDay(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

export function formatShortDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function buildTrendData(checkins = []) {
  const recent = [...checkins]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-7)

  return recent.map((item) => ({
    ...item,
    score: calculateCheckinScore(item),
    shortDay: formatShortDay(item.createdAt),
    shortDate: formatShortDate(item.createdAt),
  }))
}

export function averageScore(checkins = []) {
  if (!checkins.length) return 0
  const total = checkins.reduce((sum, item) => sum + calculateCheckinScore(item), 0)
  return (total / checkins.length).toFixed(1)
}

export function latestCheckin(checkins = []) {
  if (!checkins.length) return null
  return [...checkins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
}

export function buildInsight(checkins = []) {
  if (!checkins.length) {
    return 'Start your first check-in to unlock personal insights.'
  }

  const last = latestCheckin(checkins)
  const score = calculateCheckinScore(last)

  if (score <= 4) {
    return 'Your latest check-in suggests higher pressure. Gentle recovery steps may help today.'
  }

  if (score <= 6) {
    return 'Your mood looks a bit mixed right now. A short reset could improve the rest of your day.'
  }

  if (score <= 8) {
    return 'You seem fairly steady lately. Keep supporting that momentum with simple habits.'
  }

  return 'Your recent pattern looks strong. This is a good time to build on what is working.'
}

export function buildSVGPoints(data = [], width = 320, height = 120) {
  if (!data.length) return ''

  const maxScore = 10
  const minScore = 0
  const paddingX = 12
  const paddingY = 14
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingY * 2

  return data
    .map((item, index) => {
      const x =
        data.length === 1
          ? width / 2
          : paddingX + (usableWidth * index) / (data.length - 1)

      const y =
        paddingY + usableHeight - ((item.score - minScore) / (maxScore - minScore)) * usableHeight

      return `${x},${y}`
    })
    .join(' ')
}

export function buildSummaryStats(checkins = []) {
  if (!checkins.length) {
    return {
      averageMoodScore: '0.0',
      totalCheckins: 0,
      latestEnergy: '—',
      latestStress: '—',
    }
  }

  const last = latestCheckin(checkins)

  return {
    averageMoodScore: averageScore(checkins),
    totalCheckins: checkins.length,
    latestEnergy: Number(last?.energy || 0),
    latestStress: Number(last?.stress || 0),
  }
}