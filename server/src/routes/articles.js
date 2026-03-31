import express from 'express'
import { getArticles } from '../utils/checkins.js'

const router = express.Router()

router.get('/', (req, res) => {
  const { category, limit } = req.query
  const articles = getArticles(category, limit ? Number(limit) : undefined)
  res.json({ articles })
})

export default router
