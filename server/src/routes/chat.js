import express from 'express'
import { getSupportiveReply } from '../services/chatbotService.js'
import CheckIn from '../models/CheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import { chatStatusFor } from '../utils/chatTrigger.js'

const router = express.Router()

router.use(requireAuth)

router.get('/status', async (req, res) => {
  try {
    if (process.env.ENABLE_CHATBOT !== 'true') {
      return res.json({
        shouldTriggerChatbot: false,
        supportLevel: 'normal',
        chatbotEnabled: false,
      })
    }

    const latestCheckin = await CheckIn.findOne({ userId: req.user.userId })
      .sort({ createdAt: -1 })

    res.json({ ...chatStatusFor(latestCheckin), chatbotEnabled: true })
  } catch (error) {
    console.error('Chat status error:', error)
    res.json({
      shouldTriggerChatbot: false,
      supportLevel: 'normal',
      chatbotEnabled: process.env.ENABLE_CHATBOT === 'true',
    })
  }
})

router.post('/', async (req, res) => {
  try {
    const { messages = [], escalate = false } = req.body
    const reply = await getSupportiveReply({ messages, escalate })
    res.json({ reply })
  } catch (error) {
    console.error('Chat route error:', error)
    res.status(500).json({ message: 'Failed to generate chatbot reply.' })
  }
})

export default router