export function isConsistentlyLow(checkins) {
  const windowSize = Number(process.env.LOW_MOOD_WINDOW || 5)
  const threshold = Number(process.env.LOW_MOOD_THRESHOLD_COUNT || 3)

  const recent = checkins.slice(-windowSize)

  if (recent.length < windowSize) {
    return false
  }

  const lowCount = recent.filter((c) => {
    const lowMood = c.mood === 'low'
    const highStress = Number(c.stress) >= 7
    const lowEnergy = Number(c.energy) <= 4
    return lowMood || highStress || lowEnergy
  }).length

  return lowCount >= threshold
}

export function buildSupportStatus(checkins) {
  const shouldTriggerChatbot = isConsistentlyLow(checkins)

  return {
    shouldTriggerChatbot,
    supportLevel: shouldTriggerChatbot ? 'elevated' : 'normal',
    message: shouldTriggerChatbot
      ? "We've noticed you've been feeling low lately. Want to talk?"
      : 'You are doing okay overall.',
  }
}