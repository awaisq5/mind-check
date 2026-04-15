import express from 'express'

const router = express.Router()

router.get('/status', async (req, res) => {
  res.json({
    shouldTriggerChatbot: false,
    supportLevel: 'normal',
    message: 'Chatbot is disabled in this environment.',
  })
})

router.post('/', async (req, res) => {
  res.json({
    reply: 'Chatbot is currently disabled in this environment.',
    supportStatus: {
      shouldTriggerChatbot: false,
      supportLevel: 'normal',
      message: 'Chatbot is disabled in this environment.',
    },
  })
})

export default router