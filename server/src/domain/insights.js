// Turns a user's check-ins and questionnaire results into plain-language
// insights. Everything here is descriptive: averages, differences and simple
// rules. Nothing claims a cause, and the wording says so.

import { changeSincePrevious, dueAssessments, QUESTIONNAIRES } from './assessments.js'

export const ACTIVITIES = {
  exercise: 'exercised',
  outdoors: 'spent time outdoors',
  social: 'saw friends or family',
  work: 'worked or studied',
  meditation: 'meditated or did a breathing exercise',
  alcohol: 'drank alcohol',
  'late-screens': 'used screens late at night',
}

const DAY = 86_400_000

export function addDays(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10)
}

export function daysBetween(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY)
}

const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null)
const round1 = (x) => (x === null ? null : Math.round(x * 10) / 10)

function inRange(checkins, from, to) {
  return checkins.filter((c) => c.date >= from && c.date <= to)
}

/** Average mood, energy, anxiety and sleep for the last N days and the N days before. */
export function periodSummary(checkins, today, days) {
  const cur = inRange(checkins, addDays(today, -(days - 1)), today)
  const prev = inRange(checkins, addDays(today, -(2 * days - 1)), addDays(today, -days))
  const summary = (list) => ({
    days: list.length,
    mood: round1(mean(list.map((c) => c.mood))),
    energy: round1(mean(list.map((c) => c.energy))),
    anxiety: round1(mean(list.map((c) => c.anxiety))),
    sleepHours: round1(mean(list.filter((c) => c.sleepHours != null).map((c) => c.sleepHours))),
  })
  return { current: summary(cur), previous: summary(prev) }
}

/**
 * Mood on days with an activity against days without it. Only reported when
 * both sides have at least `minDays` days, so a single good Sunday does not
 * become a finding.
 */
export function activityEffects(checkins, { minDays = 3 } = {}) {
  const out = []
  for (const [key, phrase] of Object.entries(ACTIVITIES)) {
    const withIt = checkins.filter((c) => c.activities?.includes(key))
    const without = checkins.filter((c) => !c.activities?.includes(key))
    if (withIt.length < minDays || without.length < minDays) continue
    const a = mean(withIt.map((c) => c.mood))
    const b = mean(without.map((c) => c.mood))
    out.push({ activity: key, phrase, withDays: withIt.length, withoutDays: without.length, moodWith: round1(a), moodWithout: round1(b), difference: round1(a - b) })
  }
  return out.filter((e) => Math.abs(e.difference) >= 0.3).sort((x, y) => Math.abs(y.difference) - Math.abs(x.difference))
}

/** Mood after nights of at least 7 hours against shorter nights. */
export function sleepEffect(checkins, { minDays = 3, threshold = 7 } = {}) {
  const logged = checkins.filter((c) => c.sleepHours != null)
  const enough = logged.filter((c) => c.sleepHours >= threshold)
  const short = logged.filter((c) => c.sleepHours < threshold)
  if (enough.length < minDays || short.length < minDays) return null
  const a = mean(enough.map((c) => c.mood))
  const b = mean(short.map((c) => c.mood))
  return { threshold, enoughDays: enough.length, shortDays: short.length, moodEnough: round1(a), moodShort: round1(b), difference: round1(a - b) }
}

/** At least `count` of the last `window` logged days with mood 2 or lower. */
export function lowMoodRun(checkins, { window = 5, count = 3 } = {}) {
  const recent = [...checkins].sort((a, b) => a.date.localeCompare(b.date)).slice(-window)
  const low = recent.filter((c) => c.mood <= 2).length
  return { triggered: recent.length >= count && low >= count, lowDays: low, of: recent.length }
}

/**
 * Everything the Today and Trends screens need, in one call.
 * `today` is the user's local date (YYYY-MM-DD), sent by the client.
 */
export function buildInsights({ checkins, assessments, careContacts = [], today, now = new Date() }) {
  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date))
  const window30 = inRange(sorted, addDays(today, -29), today)
  const week = periodSummary(sorted, today, 7)
  const run = lowMoodRun(sorted)
  const effects = activityEffects(window30)
  const sleep = sleepEffect(window30)
  const due = dueAssessments(assessments, now)
  const changes = Object.keys(QUESTIONNAIRES)
    .map((type) => ({ type, ...changeSincePrevious(type, assessments) }))
    .filter((c) => c.delta !== undefined)

  const latestPhq = [...assessments].filter((a) => a.type === 'phq9').sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt))[0]

  const followUps = careContacts
    .filter((c) => c.followUpOn && c.followUpOn <= today && !['in-treatment', 'declined'].includes(c.status))
    .map((c) => ({ id: String(c._id ?? c.id), name: c.name, followUpOn: c.followUpOn }))

  const nextAppointment = careContacts
    .filter((c) => c.appointmentAt && new Date(c.appointmentAt) >= now)
    .sort((a, b) => new Date(a.appointmentAt) - new Date(b.appointmentAt))[0]

  // Prompts, most important first. Each has a kind the client maps to an action.
  const prompts = []
  if (latestPhq?.safetyFlag && now - new Date(latestPhq.takenAt) < 14 * DAY) {
    prompts.push({ kind: 'safety', text: 'Your last mood questionnaire mentioned thoughts of death or self-harm. Your safety plan and crisis contacts are one tap away.' })
  }
  for (const c of changes) {
    if (c.meaningful && c.direction === 'worse') {
      prompts.push({ kind: 'worse', text: `Your ${QUESTIONNAIRES[c.type].name} score rose from ${c.from} to ${c.to}. A change this size is worth telling your doctor or therapist about.` })
    }
  }
  if (run.triggered) {
    prompts.push({ kind: 'low-run', text: `Your mood has been low on ${run.lowDays} of your last ${run.of} check-ins. It may help to reach out to someone on your safety plan or talk it through.` })
  }
  for (const d of due.filter((x) => x.due)) {
    prompts.push({ kind: 'assessment-due', type: d.type, text: d.lastTakenAt ? `Your ${QUESTIONNAIRES[d.type].name} is due: it has been ${d.daysSince} days.` : `Take your first ${QUESTIONNAIRES[d.type].name} to set a baseline.` })
  }
  for (const f of followUps) {
    prompts.push({ kind: 'follow-up', id: f.id, text: `Follow up with ${f.name}.` })
  }

  return {
    today,
    checkedInToday: sorted.some((c) => c.date === today),
    loggedLast30: window30.length,
    week,
    lowMoodRun: run,
    activityEffects: effects,
    sleepEffect: sleep,
    assessmentsDue: due,
    assessmentChanges: changes,
    nextAppointment: nextAppointment ? { id: String(nextAppointment._id ?? nextAppointment.id), name: nextAppointment.name, appointmentAt: nextAppointment.appointmentAt } : null,
    prompts,
  }
}
