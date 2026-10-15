import express from 'express'
import Assessment from '../models/Assessment.js'
import { requireAuth } from '../middleware/auth.js'
import { AssessmentError, changeSincePrevious, DIFFICULTY_OPTIONS, ANSWER_OPTIONS, QUESTIONNAIRES, scoreAssessment } from '../domain/assessments.js'
import { resourcesFor } from '../domain/resources.js'
import { assessmentSchema, validate } from '../validation.js'

const router = express.Router()

const toResult = (a) => ({
  id: String(a._id),
  type: a.type,
  score: a.score,
  severity: a.severity,
  safetyFlag: a.safetyFlag,
  difficulty: a.difficulty,
  answers: a.answers,
  takenAt: a.takenAt,
})

/** The questionnaire texts, so the client never hard-codes them. Public. */
router.get('/questionnaires', (req, res) => {
  res.json({ questionnaires: Object.values(QUESTIONNAIRES), answerOptions: ANSWER_OPTIONS, difficultyOptions: DIFFICULTY_OPTIONS })
})

router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const items = await Assessment.find({ userId: req.user.userId }).sort({ takenAt: 1 }).lean()
    res.json({ assessments: items.map(toResult) })
  } catch (error) {
    next(error)
  }
})

router.post('/', validate(assessmentSchema), async (req, res, next) => {
  try {
    const { type, answers, difficulty = null } = req.body
    let scored
    try {
      scored = scoreAssessment(type, answers)
    } catch (error) {
      if (error instanceof AssessmentError) return res.status(400).json({ message: error.message })
      throw error
    }
    const doc = await Assessment.create({ userId: req.user.userId, type, answers, difficulty, ...scored })
    const history = await Assessment.find({ userId: req.user.userId, type }).lean()
    res.status(201).json({
      assessment: toResult(doc.toObject()),
      change: changeSincePrevious(type, history),
      // The client must show these immediately when the safety flag is set.
      resources: scored.safetyFlag ? resourcesFor(req.account.settings?.region) : null,
    })
  } catch (error) {
    next(error)
  }
})

export default router
