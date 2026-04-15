let client = null

if (process.env.OPENAI_API_KEY) {
  const OpenAI = (await import('openai')).default

  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function generateChatResponse(message) {
  if (!client) {
    return {
      reply: "Chatbot is currently disabled.",
    }
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a supportive mental health assistant.',
      },
      {
        role: 'user',
        content: message,
      },
    ],
  })

  return {
    reply: completion.choices[0].message.content,
  }
}