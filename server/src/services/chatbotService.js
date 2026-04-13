import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
})

function buildSystemPrompt({ escalate = false }) {
  return `
You are a supportive mental wellness assistant inside the Mind Check app.

Your role:
- Be warm, empathetic, calm, and human-like.
- Act like a supportive companion, not a clinical expert.
- Keep responses concise but meaningful.

Strict rules:
- DO NOT diagnose mental health conditions.
- DO NOT claim to be a therapist or doctor.
- DO NOT provide medical or clinical advice.
- DO NOT overwhelm the user with long paragraphs.

Instead:
- Validate feelings ("That sounds really difficult.")
- Encourage small actions (breathing, journaling, stepping outside)
- Suggest reaching out to someone trusted
- Ask gentle follow-up questions

Safety:
- If the user expresses self-harm, suicidal thoughts, or danger:
  → Encourage immediate help (friends, family, emergency services, helplines)
  → Stay calm and supportive

${escalate ? `
Additional instruction:
- The user has shown a consistent low mood pattern.
- Gently encourage speaking to a mental health professional.
- Do NOT be forceful — just suggest it naturally.
` : ''}

Tone:
- Friendly, calm, supportive
- 2–5 sentences max
- Conversational, not robotic
  `.trim()
}

export async function getSupportiveReply({ messages, escalate = false }) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is missing')
    }

    const formattedMessages = [
      {
        role: 'system',
        content: buildSystemPrompt({ escalate }),
      },
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const response = await client.chat.completions.create({
      model: 'openai/gpt-3.5-turbo', // FREE via OpenRouter
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 200,
    })

    const reply = response?.choices?.[0]?.message?.content?.trim()

    return (
      reply ||
      "I'm here with you. Do you want to tell me a bit more about what's been on your mind?"
    )
  } catch (error) {
    console.error('OpenRouter Chat Error:', error)

    // Fallback response (VERY IMPORTANT for UX)
    return "I'm really glad you reached out. I'm here with you — want to share a bit more about what's going on?"
  }
}