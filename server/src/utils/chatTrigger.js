// Decides whether the support chat should appear, from the latest check-in.
// The score uses the same formula as the client's progress view (1 to 10).

export function getCheckinScore(checkin) {
  const mood = String(checkin?.mood || '').toLowerCase()
  const energy = Number(checkin?.energy || 5)
  const stress = Number(checkin?.stress || 5)

  const moodBase =
    mood === 'great' ? 9 :
    mood === 'good' ? 7 :
    mood === 'okay' ? 5 :
    mood === 'low' ? 3 : 5

  const energyImpact = (energy - 5) * 0.35
  const stressImpact = (5 - stress) * 0.45

  return Math.max(1, Math.min(10, Math.round(moodBase + energyImpact + stressImpact)))
}

export function chatStatusFor(latestCheckin) {
  if (!latestCheckin) {
    return { shouldTriggerChatbot: false, supportLevel: 'normal' }
  }

  const mood = String(latestCheckin.mood || '').toLowerCase()
  const score = getCheckinScore(latestCheckin)
  const stress = Number(latestCheckin.stress || 0)

  const shouldTriggerChatbot = mood === 'low' || stress >= 7 || score <= 4
  const shouldHideChatbot = mood === 'good' || mood === 'great' || score >= 7
  const trigger = shouldHideChatbot ? false : shouldTriggerChatbot

  return {
    shouldTriggerChatbot: trigger,
    supportLevel: trigger ? 'elevated' : 'normal',
    latestMood: mood,
    latestScore: score,
  }
}
