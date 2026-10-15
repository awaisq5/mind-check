import bcrypt from 'bcryptjs'
import express from 'express'
import AppointmentQuestion from '../models/AppointmentQuestion.js'
import Assessment from '../models/Assessment.js'
import CareContact from '../models/CareContact.js'
import DailyCheckIn from '../models/DailyCheckIn.js'
import SafetyPlan from '../models/SafetyPlan.js'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { publicUser } from '../utils/auth.js'
import { CONSENT_VERSION, deleteAccountSchema, settingsSchema, validate } from '../validation.js'

const router = express.Router()
router.use(requireAuth)

const strip = ({ _id, userId, __v, ...rest }) => ({ id: String(_id), ...rest })

router.get('/', (req, res) => {
  res.json({ user: publicUser(req.account) })
})

router.patch('/', validate(settingsSchema), async (req, res, next) => {
  try {
    const { name, acceptConsent, ...settings } = req.body
    const update = {}
    if (name !== undefined) update.name = name
    if (acceptConsent) update.consent = { version: CONSENT_VERSION, acceptedAt: new Date() }
    for (const [k, v] of Object.entries(settings)) update[`settings.${k}`] = v
    const user = await User.findByIdAndUpdate(req.user.userId, { $set: update }, { returnDocument: 'after' }).lean()
    res.json({ user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

/** Everything stored about the user, as one JSON file (Art. 15 and 20 GDPR). */
router.get('/export', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const [checkIns, assessments, careContacts, questions, safetyPlan] = await Promise.all([
      DailyCheckIn.find({ userId }).sort({ date: 1 }).lean(),
      Assessment.find({ userId }).sort({ takenAt: 1 }).lean(),
      CareContact.find({ userId }).lean(),
      AppointmentQuestion.find({ userId }).lean(),
      SafetyPlan.findOne({ userId }).lean(),
    ])
    res.setHeader('Content-Disposition', `attachment; filename="mind-check-export-${new Date().toISOString().slice(0, 10)}.json"`)
    res.json({
      exportedAt: new Date().toISOString(),
      account: publicUser(req.account),
      checkIns: checkIns.map(strip),
      assessments: assessments.map(strip),
      careContacts: careContacts.map(strip),
      appointmentQuestions: questions.map(strip),
      safetyPlan: safetyPlan ? strip(safetyPlan) : null,
    })
  } catch (error) {
    next(error)
  }
})

/** Deletes the account and every record that belongs to it (Art. 17 GDPR). */
router.delete('/', validate(deleteAccountSchema), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(403).json({ message: 'That password is not correct.' })
    }
    const userId = user._id
    await Promise.all([
      DailyCheckIn.deleteMany({ userId }),
      Assessment.deleteMany({ userId }),
      CareContact.deleteMany({ userId }),
      AppointmentQuestion.deleteMany({ userId }),
      SafetyPlan.deleteOne({ userId }),
    ])
    await User.deleteOne({ _id: userId })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
