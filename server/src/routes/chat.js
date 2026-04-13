import express from 'express'
import CheckIn from '../models/CheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import { buildSupportStatus } from '../utils/moodTriggers.js'
import { getSupportiveReply } from '../services/chatbotService.js'

const router = express.Router()

router.use(requireAuth)

router.get('/status', async (req, res) => {
  try {
    const checkins = await CheckIn.find({ userId: req.user.userId })
      .sort({ createdAt: 1 })
      .lean()

    const status = buildSupportStatus(checkins)

    res.json(status)
  } catch (error) {
    console.error('Chat status error:', error)
    res.status(500).json({ message: 'Failed to get chatbot status.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { messages = [] } = req.body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages are required.' })
    }

    const checkins = await CheckIn.find({ userId: req.user.userId })
      .sort({ createdAt: 1 })
      .lean()

    const status = buildSupportStatus(checkins)

    const reply = await getSupportiveReply({
      messages,
      escalate: status.shouldTriggerChatbot,
    })

    res.json({
      reply,
      supportStatus: status,
    })
  } catch (error) {
    console.error('Chat reply error:', error)
    res.status(500).json({ message: 'Failed to generate chatbot reply.' })
  }
})

export default router