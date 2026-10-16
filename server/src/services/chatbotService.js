import OpenAI from 'openai'

const MODEL = process.env.CHAT_MODEL || 'openai/gpt-3.5-turbo'

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || process.env.ENABLE_CHATBOT !== 'true') return null
  return new OpenAI({ apiKey, baseURL: process.env.CHAT_BASE_URL || 'https://openrouter.ai/api/v1' })
}

export function companionAvailable() {
  return Boolean(process.env.OPENAI_API_KEY) && process.env.ENABLE_CHATBOT === 'true'
}

export function buildSystemPrompt({ context = null } = {}) {
  return `
You are the companion inside Mind Check, an app people use while they wait for, or between, appointments with mental health professionals.

Your role:
- Be warm, calm and brief: 2 to 5 sentences.
- Listen, reflect back what you hear, and ask one gentle question at a time.
- Suggest small, practical steps: a short walk, a breathing exercise, contacting someone they trust, writing down a question for their next appointment.
- Encourage them to bring what they share to their doctor or therapist.

Never:
- Diagnose, name conditions, or interpret questionnaire scores as a diagnosis.
- Give medical, medication or dosage advice.
- Claim to be a therapist, doctor or human.
- Discourage anyone from seeking professional help.

If the user mentions suicide, self-harm, wanting to die or being in danger, stop and tell them to contact emergency services or a crisis line immediately, and to use their safety plan.
${
  context
    ? `
The user chose to share this summary of their recent check-ins. Use it only to be more understanding; do not recite numbers back unless asked:
${context}`
    : ''
}`.trim()
}

/** A short, number-light summary of the last week, shared only if the user opted in. */
export function summariseForCompanion(insights) {
  const w = insights.week.current
  if (!w.days) return null
  const parts = [`Checked in on ${w.days} of the last 7 days.`]
  if (w.mood !== null) parts.push(`Average mood ${w.mood} out of 5${insights.week.previous.mood !== null ? ` (previous week ${insights.week.previous.mood})` : ''}.`)
  if (w.sleepHours !== null) parts.push(`Average sleep ${w.sleepHours} hours.`)
  if (insights.lowMoodRun.triggered) parts.push('Mood has been low on several recent days.')
  if (insights.nextAppointment) parts.push('They have an upcoming appointment with a professional.')
  return parts.join(' ')
}

export async function getSupportiveReply({ messages, context = null }) {
  const client = getClient()
  if (!client) {
    return "I'm here for you, but the companion isn't switched on right now. Your safety plan and the Help now page are always available."
  }

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: buildSystemPrompt({ context }) }, ...messages.slice(-12)],
      temperature: 0.6,
      max_tokens: 250,
    })
    return response?.choices?.[0]?.message?.content?.trim() || "I'm here with you. Would you like to tell me a bit more about what's been on your mind?"
  } catch (error) {
    // Never log message content: it may contain health information.
    console.error('Companion request failed:', error.status ?? error.code ?? 'unknown error')
    return "I couldn't reply just now. If things feel hard, the Help now page has people you can talk to straight away."
  }
}
