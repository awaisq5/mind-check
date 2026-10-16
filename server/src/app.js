import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoose from 'mongoose'
import assessmentRoutes from './routes/assessments.js'
import authRoutes from './routes/auth.js'
import careRoutes from './routes/care.js'
import chatRoutes from './routes/chat.js'
import checkinRoutes from './routes/checkins.js'
import insightRoutes from './routes/insights.js'
import meRoutes from './routes/me.js'

const app = express()

// Render sits behind one proxy; this makes rate limits see the real client IP.
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((s) => s.trim()) : '*' }))
app.use(express.json({ limit: '100kb' }))

const limiter = (limit, windowMinutes = 15) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Too many requests. Please wait a few minutes and try again.' },
    skip: () => process.env.NODE_ENV === 'test',
  })

// Pinged by UptimeRobot every 5 minutes: keeps Render awake and touches
// MongoDB Atlas so the free cluster never counts as inactive.
app.get('/api/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping()
    res.json({ ok: true, db: 'connected', message: 'Mind Check API is running.' })
  } catch (error) {
    console.error('Health check DB ping failed:', error.message)
    res.status(503).json({ ok: false, db: 'unreachable' })
  }
})

app.use('/api/auth', limiter(20), authRoutes)
app.use('/api', limiter(600))
app.use('/api/me', meRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/assessments', assessmentRoutes)
app.use('/api/care', careRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api', insightRoutes)

app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }))

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'That request is too large.' })
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'The request body is not valid JSON.' })
  if (err.name === 'ValidationError') return res.status(400).json({ message: Object.values(err.errors)[0]?.message ?? 'Invalid input.' })
  if (err.code === 11000) return res.status(409).json({ message: 'That already exists.' })
  // Log the error type only: request bodies can contain health data.
  console.error(`${req.method} ${req.path} failed:`, err.name, err.message)
  res.status(500).json({ message: 'Something went wrong on our side. Please try again.' })
})

export default app
