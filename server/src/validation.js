import { z } from 'zod'
import { ASSESSMENT_TYPES } from './domain/assessments.js'
import { REGION_CODES } from './domain/resources.js'
import { ACTIVITY_KEYS } from './models/DailyCheckIn.js'
import { CONTACT_KINDS, CONTACT_STATUSES } from './models/CareContact.js'

export const CONSENT_VERSION = '2026-10'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in the form YYYY-MM-DD.')
const scale = z.number().int().min(1).max(5)
const shortText = (max) => z.string().trim().max(max)

export const registerSchema = z.object({
  name: shortText(60).min(1, 'Enter your name.'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(10, 'Use at least 10 characters for your password.').max(200),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please agree to how your health data is processed.' }) }),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const settingsSchema = z
  .object({
    name: shortText(60).min(1),
    region: z.enum(REGION_CODES),
    shareContextWithCompanion: z.boolean(),
    reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a time like 20:00.'),
    // Accounts from before consent was recorded accept the current notice here.
    acceptConsent: z.literal(true),
  })
  .partial()

export const deleteAccountSchema = z.object({ password: z.string().min(1, 'Enter your password to confirm.') })

export const checkInSchema = z.object({
  mood: scale,
  energy: scale,
  anxiety: scale,
  sleepHours: z.number().min(0).max(16).nullable().optional(),
  sleepQuality: scale.nullable().optional(),
  activities: z.array(z.enum(ACTIVITY_KEYS)).max(ACTIVITY_KEYS.length).optional(),
  note: shortText(1000).optional(),
  includeInReport: z.boolean().optional(),
})

export const assessmentSchema = z.object({
  type: z.enum(ASSESSMENT_TYPES),
  answers: z.array(z.number().int().min(0).max(3)),
  difficulty: z.number().int().min(0).max(3).nullable().optional(),
})

export const careContactSchema = z.object({
  name: shortText(120).min(1, 'Enter a name.'),
  kind: z.enum(CONTACT_KINDS).optional(),
  phone: shortText(40).optional(),
  email: z.union([z.literal(''), z.string().trim().email()]).optional(),
  status: z.enum(CONTACT_STATUSES).optional(),
  lastContactOn: isoDate.nullable().optional(),
  followUpOn: isoDate.nullable().optional(),
  appointmentAt: z.string().datetime({ offset: true }).nullable().optional(),
  notes: shortText(1000).optional(),
})

export const questionSchema = z.object({
  text: shortText(500).min(1, 'Write your question.'),
  done: z.boolean().optional(),
})

const items = z.array(shortText(300)).max(20)
const people = z.array(z.object({ name: shortText(80), phone: shortText(40) })).max(10)

export const safetyPlanSchema = z.object({
  warningSigns: items,
  copingStrategies: items,
  distractions: items,
  supportPeople: people,
  professionals: people,
  safeEnvironment: items,
  reasonsToLive: items,
})

export const chatSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(30),
})

export { isoDate }

/** Express middleware: replaces req.body with the parsed value or answers 400. */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {})
    if (!result.success) {
      return res.status(400).json({
        message: result.error.issues[0]?.message ?? 'Invalid input.',
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      })
    }
    req.body = result.data
    next()
  }
}
