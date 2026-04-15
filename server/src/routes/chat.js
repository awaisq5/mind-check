import express from 'express'
import { generateChatResponse } from '../services/chatbotService.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    const { message } = req.body

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        reply: "Chatbot is disabled in this environment.",
      })
    }
    
    if (!process.env.OPENAI_API_KEY || process.env.ENABLE_CHATBOT !== 'true') {

    const result = await generateChatResponse(message)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Chat failed' })
  }
})

export default router