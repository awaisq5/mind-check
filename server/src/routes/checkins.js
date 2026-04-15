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


/*import express from 'express'
import CheckIn from '../models/CheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import {
  analyzeCheckin,
  buildSummary,
  calculateScore,
  getArticles,
} from '../utils/checkins.js'

const router = express.Router()

router.use(requireAuth)

router.post('/', async (req, res) => {
  try {
    const { mood, energy, stress, notes = '' } = req.body

    if (!mood || energy == null || stress == null) {
      return res.status(400).json({ message: 'Mood, energy, and stress are required.' })
    }

    const analysis = analyzeCheckin({ mood, energy, stress })
    const score = calculateScore({ mood, energy, stress })

    const checkin = await CheckIn.create({
      userId: req.user.userId,
      mood,
      energy: Number(energy),
      stress: Number(stress),
      notes,
      score,
    })

    const articles = getArticles(analysis.articleCategory, 2)

    res.status(201).json({
      checkin: {
        id: checkin._id,
        userId: checkin.userId,
        mood: checkin.mood,
        energy: checkin.energy,
        stress: checkin.stress,
        notes: checkin.notes,
        score: checkin.score,
        createdAt: checkin.createdAt,
      },
      feedback: analysis.feedback,
      suggestions: analysis.suggestions,
      articles,
    })
  } catch (error) {
    console.error('Create check-in error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

router.get('/', async (req, res) => {
  try {
    const userCheckins = await CheckIn.find({ userId: req.user.userId }).sort({ createdAt: 1 })

    res.json({
      checkins: userCheckins.map((item) => ({
        id: item._id,
        userId: item.userId,
        mood: item.mood,
        energy: item.energy,
        stress: item.stress,
        notes: item.notes,
        score: item.score,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get check-ins error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

router.get('/summary', async (req, res) => {
  try {
    const userCheckins = await CheckIn.find({ userId: req.user.userId }).sort({ createdAt: 1 })

    const plainCheckins = userCheckins.map((item) => ({
      id: item._id.toString(),
      userId: item.userId.toString(),
      mood: item.mood,
      energy: item.energy,
      stress: item.stress,
      notes: item.notes,
      score: item.score,
      createdAt: item.createdAt,
    }))

    res.json(buildSummary(plainCheckins))
  } catch (error) {
    console.error('Summary error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

export default router */

