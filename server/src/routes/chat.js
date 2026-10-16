import express from 'express'
import rateLimit from 'express-rate-limit'
import Assessment from '../models/Assessment.js'
import CareContact from '../models/CareContact.js'
import DailyCheckIn from '../models/DailyCheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import { crisisReply, detectCrisis } from '../domain/crisis.js'
import { addDays, buildInsights } from '../domain/insights.js'
import { resourcesFor } from '../domain/resources.js'
import { companionAvailable, getSupportiveReply, summariseForCompanion } from '../services/chatbotService.js'
import { chatSchema, validate } from '../validation.js'

const router = express.Router()
router.use(requireAuth)

// Each message costs money and the companion is not a substitute for people.
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.CHAT_LIMIT_PER_HOUR || 40),
  keyGenerator: (req) => req.user.userId,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: "You've sent a lot of messages this hour. Take a short break; the Help now page is always available." },
})

router.get('/status', (req, res) => {
  res.json({ available: companionAvailable(), sharesContext: Boolean(req.account.settings?.shareContextWithCompanion) })
})

router.post('/', limiter, validate(chatSchema), async (req, res, next) => {
  try {
    const { messages } = req.body
    const last = messages[messages.length - 1]

    // Risk language never goes to the model: the reply is fixed and points to people.
    if (last.role === 'user' && detectCrisis(last.content)) {
      const resources = resourcesFor(req.account.settings?.region)
      return res.json({ reply: crisisReply(resources), crisis: true, resources })
    }

    let context = null
    if (req.account.settings?.shareContextWithCompanion) {
      const userId = req.user.userId
      const today = new Date().toISOString().slice(0, 10)
      const [checkins, assessments, careContacts] = await Promise.all([
        DailyCheckIn.find({ userId, date: { $gte: addDays(today, -13) } }).lean(),
        Assessment.find({ userId }).lean(),
        CareContact.find({ userId }).lean(),
      ])
      context = summariseForCompanion(buildInsights({ checkins, assessments, careContacts, today }))
    }

    const reply = await getSupportiveReply({ messages, context })
    res.json({ reply, crisis: false })
  } catch (error) {
    next(error)
  }
})

export default router
