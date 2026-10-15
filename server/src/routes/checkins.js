import express from 'express'
import DailyCheckIn from '../models/DailyCheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import { checkInSchema, isoDate, validate } from '../validation.js'

const router = express.Router()
router.use(requireAuth)

export const toCheckIn = (c) => ({
  id: String(c._id),
  date: c.date,
  mood: c.mood,
  energy: c.energy,
  anxiety: c.anxiety,
  sleepHours: c.sleepHours ?? null,
  sleepQuality: c.sleepQuality ?? null,
  activities: c.activities ?? [],
  note: c.note ?? '',
  includeInReport: c.includeInReport ?? false,
})

/** GET /api/checkins?from=YYYY-MM-DD&to=YYYY-MM-DD, oldest first. */
router.get('/', async (req, res, next) => {
  try {
    const filter = { userId: req.user.userId }
    const range = {}
    if (req.query.from) {
      if (!isoDate.safeParse(req.query.from).success) return res.status(400).json({ message: '`from` must be YYYY-MM-DD.' })
      range.$gte = req.query.from
    }
    if (req.query.to) {
      if (!isoDate.safeParse(req.query.to).success) return res.status(400).json({ message: '`to` must be YYYY-MM-DD.' })
      range.$lte = req.query.to
    }
    if (Object.keys(range).length) filter.date = range
    const items = await DailyCheckIn.find(filter).sort({ date: 1 }).limit(800).lean()
    res.json({ checkIns: items.map(toCheckIn) })
  } catch (error) {
    next(error)
  }
})

/** PUT /api/checkins/:date creates or replaces that day's check-in: one per day. */
router.put('/:date', validate(checkInSchema), async (req, res, next) => {
  try {
    const { date } = req.params
    if (!isoDate.safeParse(date).success) return res.status(400).json({ message: 'The date must be YYYY-MM-DD.' })
    const tomorrow = new Date(Date.now() + 36 * 3_600_000).toISOString().slice(0, 10)
    if (date > tomorrow) return res.status(400).json({ message: 'You cannot check in for a future date.' })

    const existing = await DailyCheckIn.exists({ userId: req.user.userId, date })
    const doc = await DailyCheckIn.findOneAndUpdate(
      { userId: req.user.userId, date },
      { $set: { ...req.body, userId: req.user.userId, date } },
      { upsert: true, returnDocument: 'after', runValidators: true },
    ).lean()
    res.status(existing ? 200 : 201).json({ checkIn: toCheckIn(doc) })
  } catch (error) {
    next(error)
  }
})

router.delete('/:date', async (req, res, next) => {
  try {
    const result = await DailyCheckIn.deleteOne({ userId: req.user.userId, date: req.params.date })
    if (!result.deletedCount) return res.status(404).json({ message: 'No check-in on that date.' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default router
