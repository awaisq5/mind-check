import express from 'express'
import AppointmentQuestion from '../models/AppointmentQuestion.js'
import Assessment from '../models/Assessment.js'
import CareContact from '../models/CareContact.js'
import DailyCheckIn from '../models/DailyCheckIn.js'
import { requireAuth } from '../middleware/auth.js'
import { QUESTIONNAIRES } from '../domain/assessments.js'
import { addDays, buildInsights, periodSummary } from '../domain/insights.js'
import { resourcesFor } from '../domain/resources.js'
import { isoDate } from '../validation.js'
import { toCheckIn } from './checkins.js'

const router = express.Router()

/** Crisis and care contacts for a region. Public: needed before anyone signs up. */
router.get('/resources', (req, res) => {
  res.json({ resources: resourcesFor(String(req.query.region ?? 'DE').toUpperCase()) })
})

// The client sends its local date so "today" matches the user's calendar.
function todayFrom(req) {
  const t = req.query.today
  return t && isoDate.safeParse(t).success ? t : new Date().toISOString().slice(0, 10)
}

router.get('/insights', requireAuth, async (req, res, next) => {
  try {
    const today = todayFrom(req)
    const userId = req.user.userId
    const [checkins, assessments, careContacts] = await Promise.all([
      DailyCheckIn.find({ userId, date: { $gte: addDays(today, -89), $lte: today } }).lean(),
      Assessment.find({ userId }).lean(),
      CareContact.find({ userId }).lean(),
    ])
    res.json({ insights: buildInsights({ checkins, assessments, careContacts, today }) })
  } catch (error) {
    next(error)
  }
})

/**
 * Everything for the printable summary a user can take to an appointment:
 * daily values, weekly averages, questionnaire results, the notes they chose
 * to share and their open questions. Private notes are never included.
 */
router.get('/report', requireAuth, async (req, res, next) => {
  try {
    const today = todayFrom(req)
    const days = Math.min(180, Math.max(14, Number(req.query.days) || 90))
    const from = addDays(today, -(days - 1))
    const userId = req.user.userId
    const [checkins, assessments, questions, careContacts] = await Promise.all([
      DailyCheckIn.find({ userId, date: { $gte: from, $lte: today } }).sort({ date: 1 }).lean(),
      Assessment.find({ userId, takenAt: { $gte: new Date(`${from}T00:00:00Z`) } }).sort({ takenAt: 1 }).lean(),
      AppointmentQuestion.find({ userId, done: false }).sort({ createdAt: 1 }).lean(),
      CareContact.find({ userId }).sort({ updatedAt: -1 }).lean(),
    ])

    // Start at the first check-in in the period, so a new user's report has no empty weeks.
    const start = checkins[0]?.date && checkins[0].date > from ? checkins[0].date : from
    const weeks = []
    for (let end = today; end >= start; end = addDays(end, -7)) {
      const weekStart = addDays(end, -6) < start ? start : addDays(end, -6)
      const s = periodSummary(checkins.filter((c) => c.date >= weekStart && c.date <= end), end, 7).current
      weeks.unshift({ start: weekStart, end, ...s })
    }

    res.json({
      report: {
        name: req.account.name,
        from: start,
        to: today,
        generatedAt: new Date().toISOString(),
        daysLogged: checkins.length,
        checkIns: checkins.map((c) => ({ ...toCheckIn(c), note: c.includeInReport ? c.note : '' })),
        weeks,
        assessments: assessments.map((a) => ({
          type: a.type,
          name: QUESTIONNAIRES[a.type].name,
          score: a.score,
          max: QUESTIONNAIRES[a.type].max,
          severity: a.severity,
          safetyFlag: a.safetyFlag,
          takenAt: a.takenAt,
        })),
        sharedNotes: checkins.filter((c) => c.includeInReport && c.note).map((c) => ({ date: c.date, note: c.note, mood: c.mood })),
        questions: questions.map((q) => q.text),
        care: careContacts.map((c) => ({ name: c.name, kind: c.kind, status: c.status, appointmentAt: c.appointmentAt })),
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
