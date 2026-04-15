import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import articleRoutes from './routes/articles.js'
import checkinRoutes from './routes/checkins.js'
import resourceRoutes from './routes/resources.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL?.split(',') || '*' }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Mind Check API is running.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/articles', articleRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/resources', resourceRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error.' })
})

export default app
