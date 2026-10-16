import bcrypt from 'bcryptjs'
import express from 'express'
import User from '../models/User.js'
import { publicUser, signToken } from '../utils/auth.js'
import { CONSENT_VERSION, loginSchema, registerSchema, validate } from '../validation.js'

const router = express.Router()

// Compared against when the email is unknown, so a login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10)

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (await User.exists({ email })) {
      return res.status(409).json({ message: 'An account with that email already exists.' })
    }
    const user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      consent: { version: CONSENT_VERSION, acceptedAt: new Date() },
    })
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)
    if (!user || !valid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }
    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    next(error)
  }
})

export default router
