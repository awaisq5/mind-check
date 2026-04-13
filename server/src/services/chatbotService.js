import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getSupportiveReply({ messages, escalate = false }) {
  const systemPrompt = `
You are a supportive mental wellness assistant inside the Mind Check app.

Rules:
- Be warm, calm, empathetic, and concise.
- Do not diagnose medical or mental health conditions.
- Do not claim to be a therapist or doctor.
- Do not provide medical advice.
- Encourage healthy coping strategies like breathing, journaling, hydration, stepping outside, talking to someone trusted, or resting.
- If the user seems consistently low, gently encourage speaking to a qualified mental health professional.
- If the user sounds in immediate danger or crisis, strongly encourage contacting local emergency services or a crisis helpline immediately.
- Keep replies practical and emotionally supportive.
- Keep most replies under 120 words.
${escalate ? '- In this reply, gently recommend professional support.' : ''}
  `.trim()

  const inputMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ]

  const response = await client.responses.create({
    model: 'gpt-5.4',
    input: inputMessages,
  })

  return response.output_text
}