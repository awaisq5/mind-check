import express from 'express'
import CheckIn from '../models/CheckIn.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', async (req, res) => {
  try {
    const checkins = await CheckIn.find({ userId: req.user.userId }).sort({ createdAt: -1 })
    res.json(checkins)
  } catch (error) {
    console.error('Fetch check-ins error:', error)
    res.status(500).json({ message: 'Failed to fetch check-ins.' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { mood, energy, stress, notes } = req.body

    const normalizedMood = String(mood || '').toLowerCase().trim()

    const checkin = await CheckIn.create({
      userId: req.user.userId,
      mood: normalizedMood,
      energy,
      stress,
      notes,
    })

    res.status(201).json(checkin)
  } catch (error) {
    console.error('Create check-in error:', error)
    res.status(500).json({ message: 'Failed to create check-in.' })
  }
})

export default router
