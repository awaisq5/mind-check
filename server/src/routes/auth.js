import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signToken } from '../utils/auth.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    })

    const token = signToken(user)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const token = signToken(user)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

export default router