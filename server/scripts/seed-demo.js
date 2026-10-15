// Creates a demo account with six weeks of realistic, invented data:
//   npm run seed:demo          (uses MONGO_URI from .env)
// Log in as demo@mindcheck.example / demo-password-123. Running it again resets the account.
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import { scoreAssessment } from '../src/domain/assessments.js'
import { addDays } from '../src/domain/insights.js'
import AppointmentQuestion from '../src/models/AppointmentQuestion.js'
import Assessment from '../src/models/Assessment.js'
import CareContact from '../src/models/CareContact.js'
import DailyCheckIn from '../src/models/DailyCheckIn.js'
import SafetyPlan from '../src/models/SafetyPlan.js'
import User from '../src/models/User.js'
import { CONSENT_VERSION } from '../src/validation.js'

export const DEMO_EMAIL = 'demo@mindcheck.example'
export const DEMO_PASSWORD = 'demo-password-123'

export async function seedDemo(today = new Date().toISOString().slice(0, 10)) {
  let seed = 7
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const clamp = (v) => Math.max(1, Math.min(5, Math.round(v)))

  const old = await User.findOne({ email: DEMO_EMAIL })
  if (old) {
    const userId = old._id
    await Promise.all([
      DailyCheckIn.deleteMany({ userId }),
      Assessment.deleteMany({ userId }),
      CareContact.deleteMany({ userId }),
      AppointmentQuestion.deleteMany({ userId }),
      SafetyPlan.deleteOne({ userId }),
    ])
    await User.deleteOne({ _id: userId })
  }
  const user = await User.create({
    name: 'Alex',
    email: DEMO_EMAIL,
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    consent: { version: CONSENT_VERSION, acceptedAt: new Date(`${addDays(today, -42)}T09:00:00Z`) },
    settings: { region: 'DE', shareContextWithCompanion: true, reminderTime: '20:00' },
  })
  const userId = user._id

  // Six weeks: a difficult start that slowly improves, with exercise and sleep helping.
  const docs = []
  for (let i = 41; i >= 0; i--) {
    if (rand() < 0.14 && i > 1) continue
    const date = addDays(today, -i)
    const progress = (41 - i) / 41
    const exercise = rand() < 0.25 + progress * 0.3
    const outdoors = exercise || rand() < 0.3
    const social = rand() < 0.35
    const work = new Date(`${date}T12:00:00Z`).getUTCDay() % 6 !== 0
    const lateScreens = rand() < 0.45 - progress * 0.2
    const sleep = Math.round((5.6 + progress * 1.4 + (lateScreens ? -0.8 : 0.4) + (rand() - 0.5) * 1.6) * 2) / 2
    const base = 2.1 + progress * 1.3 + (exercise ? 0.5 : 0) + (social ? 0.3 : 0) + (sleep >= 7 ? 0.4 : -0.2) + (rand() - 0.5) * 1.2
    const activities = [
      exercise && 'exercise',
      outdoors && 'outdoors',
      social && 'social',
      work && 'work',
      lateScreens && 'late-screens',
      rand() < 0.15 && 'alcohol',
      rand() < 0.2 + progress * 0.2 && 'meditation',
    ].filter(Boolean)
    docs.push({
      userId,
      date,
      mood: clamp(base),
      energy: clamp(base - 0.3 + (rand() - 0.5)),
      anxiety: clamp(4.3 - progress * 1.4 - (exercise ? 0.4 : 0) + (rand() - 0.5) * 1.2),
      sleepHours: Math.max(3, Math.min(10, sleep)),
      sleepQuality: clamp(2 + progress * 1.5 + (rand() - 0.5) * 1.5),
      activities,
      note: '',
    })
  }
  const notes = {
    [addDays(today, -38)]: ['Could not get out of bed until noon. Cancelled plans again.', true],
    [addDays(today, -30)]: ['Called four practices. Two have no waiting list space at all.', true],
    [addDays(today, -19)]: ['Walked by the river with Sam. First evening in a while that felt normal.', true],
    [addDays(today, -8)]: ['Work meeting went better than I feared.', false],
    [addDays(today, -2)]: ['Slept badly, mind racing about money.', true],
  }
  for (const d of docs) if (notes[d.date]) [d.note, d.includeInReport] = notes[d.date]
  await DailyCheckIn.insertMany(docs)

  const tests = [
    [42, 'phq9', [2, 2, 2, 2, 1, 2, 1, 1, 0]],
    [42, 'gad7', [2, 2, 2, 2, 1, 2, 1]],
    [28, 'phq9', [2, 2, 2, 1, 1, 1, 1, 1, 0]],
    [28, 'gad7', [2, 2, 2, 1, 1, 1, 1]],
    [14, 'phq9', [1, 1, 2, 1, 1, 1, 1, 0, 0]],
    [14, 'gad7', [1, 2, 1, 1, 1, 1, 1]],
  ]
  await Assessment.insertMany(
    tests.map(([ago, type, answers]) => ({ userId, type, answers, difficulty: 1, ...scoreAssessment(type, answers), takenAt: new Date(`${addDays(today, -ago)}T19:00:00Z`) })),
  )

  await CareContact.insertMany([
    { userId, name: 'Praxis Dr. Weber', kind: 'psychotherapist', phone: '+49 511 0000000', status: 'waiting-list', lastContactOn: addDays(today, -21), followUpOn: addDays(today, -1), notes: 'Phone hours Tue and Thu 8:30–9:30. Estimated wait about three months.' },
    { userId, name: 'Psychotherapie am Markt', kind: 'psychotherapist', phone: '+49 5141 000000', status: 'appointment-booked', lastContactOn: addDays(today, -9), appointmentAt: new Date(`${addDays(today, 6)}T09:30:00`), notes: 'First consultation (Sprechstunde) booked through 116117.' },
    { userId, name: 'Dr. Yilmaz (GP)', kind: 'gp', phone: '+49 5141 111111', status: 'in-treatment', lastContactOn: addDays(today, -35), notes: 'Referred me; check-in appointment every 4 weeks.' },
    { userId, name: 'Praxis Hoffmann', kind: 'psychotherapist', status: 'declined', lastContactOn: addDays(today, -30), notes: 'Not taking new patients this year.' },
    { userId, name: 'Beratungsstelle Celle', kind: 'counselling', status: 'to-contact', followUpOn: addDays(today, 2) },
  ])
  await AppointmentQuestion.insertMany([
    { userId, text: 'Could my sleep problems be part of this, or a separate thing?' },
    { userId, text: 'What can I do while I am on waiting lists?' },
    { userId, text: 'Is it normal that mornings are the worst?' },
  ])
  await SafetyPlan.create({
    userId,
    warningSigns: ['I stop answering messages', 'Staying in bed past noon', 'Thinking everyone would be better off without me'],
    copingStrategies: ['A walk around the block, even for ten minutes', 'Cold water on my face, then box breathing', 'Music from my "steady" playlist'],
    distractions: ['The café on the market square', 'Calling my sister about anything at all'],
    supportPeople: [
      { name: 'Sam', phone: '+49 170 0000000' },
      { name: 'My sister Lea', phone: '+49 171 0000000' },
    ],
    professionals: [{ name: 'Dr. Yilmaz (GP)', phone: '+49 5141 111111' }],
    safeEnvironment: ['Ask Sam to keep the spare medication'],
    reasonsToLive: ['Lea and her kids', 'Finishing my apprenticeship', 'The trip to the coast next summer'],
  })
  return user
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await mongoose.connect(process.env.MONGO_URI)
  await seedDemo()
  console.log(`Demo account ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
  await mongoose.disconnect()
}
