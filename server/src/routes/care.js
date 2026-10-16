import express from 'express'
import mongoose from 'mongoose'
import AppointmentQuestion from '../models/AppointmentQuestion.js'
import CareContact from '../models/CareContact.js'
import SafetyPlan from '../models/SafetyPlan.js'
import { requireAuth } from '../middleware/auth.js'
import { careContactSchema, questionSchema, safetyPlanSchema, validate } from '../validation.js'

const router = express.Router()
router.use(requireAuth)

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(404).json({ message: 'Not found.' })

const toContact = (c) => ({
  id: String(c._id),
  name: c.name,
  kind: c.kind,
  phone: c.phone,
  email: c.email,
  status: c.status,
  lastContactOn: c.lastContactOn,
  followUpOn: c.followUpOn,
  appointmentAt: c.appointmentAt,
  notes: c.notes,
  updatedAt: c.updatedAt,
})

const toQuestion = (q) => ({ id: String(q._id), text: q.text, done: q.done, createdAt: q.createdAt })

// Care contacts: the practices and services the user is trying to get care from.

router.get('/contacts', async (req, res, next) => {
  try {
    const items = await CareContact.find({ userId: req.user.userId }).sort({ updatedAt: -1 }).lean()
    res.json({ contacts: items.map(toContact) })
  } catch (error) {
    next(error)
  }
})

router.post('/contacts', validate(careContactSchema), async (req, res, next) => {
  try {
    const doc = await CareContact.create({ ...req.body, userId: req.user.userId })
    res.status(201).json({ contact: toContact(doc) })
  } catch (error) {
    next(error)
  }
})

router.patch('/contacts/:id', validId, validate(careContactSchema.partial()), async (req, res, next) => {
  try {
    const doc = await CareContact.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { returnDocument: 'after', runValidators: true }).lean()
    if (!doc) return res.status(404).json({ message: 'Not found.' })
    res.json({ contact: toContact(doc) })
  } catch (error) {
    next(error)
  }
})

router.delete('/contacts/:id', validId, async (req, res, next) => {
  try {
    const r = await CareContact.deleteOne({ _id: req.params.id, userId: req.user.userId })
    if (!r.deletedCount) return res.status(404).json({ message: 'Not found.' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Questions for the next appointment.

router.get('/questions', async (req, res, next) => {
  try {
    const items = await AppointmentQuestion.find({ userId: req.user.userId }).sort({ createdAt: 1 }).lean()
    res.json({ questions: items.map(toQuestion) })
  } catch (error) {
    next(error)
  }
})

router.post('/questions', validate(questionSchema), async (req, res, next) => {
  try {
    const doc = await AppointmentQuestion.create({ ...req.body, userId: req.user.userId })
    res.status(201).json({ question: toQuestion(doc) })
  } catch (error) {
    next(error)
  }
})

router.patch('/questions/:id', validId, validate(questionSchema.partial()), async (req, res, next) => {
  try {
    const doc = await AppointmentQuestion.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: req.body }, { returnDocument: 'after' }).lean()
    if (!doc) return res.status(404).json({ message: 'Not found.' })
    res.json({ question: toQuestion(doc) })
  } catch (error) {
    next(error)
  }
})

router.delete('/questions/:id', validId, async (req, res, next) => {
  try {
    const r = await AppointmentQuestion.deleteOne({ _id: req.params.id, userId: req.user.userId })
    if (!r.deletedCount) return res.status(404).json({ message: 'Not found.' })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Safety plan: one per user.

const EMPTY_PLAN = { warningSigns: [], copingStrategies: [], distractions: [], supportPeople: [], professionals: [], safeEnvironment: [], reasonsToLive: [] }

const toPlan = (p) =>
  p
    ? {
        warningSigns: p.warningSigns,
        copingStrategies: p.copingStrategies,
        distractions: p.distractions,
        supportPeople: p.supportPeople.map(({ name, phone }) => ({ name, phone })),
        professionals: p.professionals.map(({ name, phone }) => ({ name, phone })),
        safeEnvironment: p.safeEnvironment,
        reasonsToLive: p.reasonsToLive,
        updatedAt: p.updatedAt,
      }
    : { ...EMPTY_PLAN, updatedAt: null }

router.get('/safety-plan', async (req, res, next) => {
  try {
    res.json({ plan: toPlan(await SafetyPlan.findOne({ userId: req.user.userId }).lean()) })
  } catch (error) {
    next(error)
  }
})

router.put('/safety-plan', validate(safetyPlanSchema), async (req, res, next) => {
  try {
    const clean = (xs) => xs.filter((x) => (typeof x === 'string' ? x : x.name || x.phone))
    const body = Object.fromEntries(Object.entries(req.body).map(([k, v]) => [k, clean(v)]))
    const doc = await SafetyPlan.findOneAndUpdate({ userId: req.user.userId }, { $set: { ...body, userId: req.user.userId } }, { upsert: true, returnDocument: 'after' }).lean()
    res.json({ plan: toPlan(doc) })
  } catch (error) {
    next(error)
  }
})

export default router
