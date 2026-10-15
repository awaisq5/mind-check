import express from 'express'
import { SUPPORT_OPTIONS } from '../utils/content.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/support', requireAuth, (req, res) => {
  res.json({ options: SUPPORT_OPTIONS })
})

export default router
