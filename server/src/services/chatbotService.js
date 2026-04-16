import OpenAI from 'openai'

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey || process.env.ENABLE_CHATBOT !== 'true') {
    return null
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
  })
}

function buildSystemPrompt({ escalate = false }) {
  return `
You are a supportive mental wellness assistant inside the Mind Check app.

Your role:
- Be warm, empathetic, calm, and human-like
- Act like a supportive companion, not a clinical expert
- Keep responses concise but meaningful

Strict rules:
- Do not diagnose mental health conditions
- Do not claim to be a therapist or doctor
- Do not provide medical or clinical advice
- Do not overwhelm the user with long paragraphs

Instead:
- Validate feelings
- Encourage small actions
- Suggest reaching out to someone trusted
- Ask gentle follow-up questions

Safety:
- If the user expresses self-harm, suicidal thoughts, or danger:
  Encourage immediate help from emergency services, crisis helplines, or someone trusted

${escalate ? `
Additional instruction:
- The user has shown a consistent low mood pattern
- Gently encourage speaking to a mental health professional
` : ''}

Tone:
- Friendly
- Calm
- Supportive
- 2 to 5 sentences max
`.trim()
}

export async function getSupportiveReply({ messages, escalate = false }) {
  const client = getClient()

  if (!client) {
    return "I'm here for you. The AI support chat is currently unavailable in this environment."
  }

  try {
    const response = await client.chat.completions.create({
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt({ escalate }),
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return (
      response?.choices?.[0]?.message?.content?.trim() ||
      "I'm here with you. Do you want to tell me a bit more about what's been on your mind?"
    )
  } catch (error) {
    console.error('Chatbot service error:', error)
    return "I'm glad you reached out. I'm here with you — want to share a bit more about what's going on?"
  }
}