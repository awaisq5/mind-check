import dotenv from 'dotenv'
import app from './app.js'
import { connectDB } from './config/db.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET
const MONGO_URI = process.env.MONGO_URI

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment variables.')
  process.exit(1)
}

if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment variables.')
  process.exit(1)
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Mind Check API listening on port ${PORT}`)
  })
})