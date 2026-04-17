import express from 'express'
import { getSupportiveReply } from '../services/chatbotService.js'
import CheckIn from '../models/CheckIn.js'
import { requireAuth } from '../middleware/auth.js'

function getCheckinScore(checkin) {
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

    if (!latestCheckin) {
      return res.json({
        shouldTriggerChatbot: false,
        supportLevel: 'normal',
        chatbotEnabled: true,
      })
    }

    const mood = String(latestCheckin.mood || '').toLowerCase()
    const score = getCheckinScore(latestCheckin)
    const stress = Number(latestCheckin.stress || 0)

    const shouldTriggerChatbot =
      mood === 'low' || stress >= 7 || score <= 4

    const shouldHideChatbot =
      mood === 'good' || mood === 'great' || score >= 7

    res.json({
      shouldTriggerChatbot: shouldHideChatbot ? false : shouldTriggerChatbot,
      supportLevel: shouldHideChatbot ? 'normal' : shouldTriggerChatbot ? 'elevated' : 'normal',
      chatbotEnabled: true,
      latestMood: mood,
      latestScore: score,
    })
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