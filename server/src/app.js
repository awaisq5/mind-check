import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import articleRoutes from './routes/articles.js'
import checkinRoutes from './routes/checkins.js'
import resourceRoutes from './routes/resources.js'
import chatRoutes from './routes/chat.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*' }))
app.use(express.json())

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

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/chat', chatRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

export default app
