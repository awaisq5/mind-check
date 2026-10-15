/** The user's local calendar date as YYYY-MM-DD. */
export function localToday(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(date, days) {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return localToday(d)
}

export function formatDate(date, opts = { day: 'numeric', month: 'short' }) {
  if (!date) return ''
  const d = typeof date === 'string' && date.length === 10 ? new Date(`${date}T12:00:00`) : new Date(date)
  return d.toLocaleDateString('en-GB', opts)
}

export function formatDateTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function greeting(d = new Date()) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export const SCALES = {
  mood: { label: 'Mood', options: ['Very low', 'Low', 'Okay', 'Good', 'Very good'] },
  energy: { label: 'Energy', options: ['Exhausted', 'Low', 'Okay', 'Good', 'Full of energy'] },
  anxiety: { label: 'Anxiety', options: ['None', 'A little', 'Some', 'High', 'Very high'] },
  sleepQuality: { label: 'Sleep quality', options: ['Very poor', 'Poor', 'Okay', 'Good', 'Very good'] },
}

export const ACTIVITIES = [
  { key: 'exercise', label: 'Exercise' },
  { key: 'outdoors', label: 'Time outdoors' },
  { key: 'social', label: 'Saw people' },
  { key: 'work', label: 'Work or study' },
  { key: 'meditation', label: 'Breathing or meditation' },
  { key: 'alcohol', label: 'Alcohol' },
  { key: 'late-screens', label: 'Screens late at night' },
]

export const CONTACT_KINDS = {
  psychotherapist: 'Psychotherapist',
  gp: 'GP / family doctor',
  psychiatrist: 'Psychiatrist',
  clinic: 'Clinic or outpatient service',
  counselling: 'Counselling service',
  other: 'Other',
}

export const CONTACT_STATUSES = {
  'to-contact': 'To contact',
  contacted: 'Contacted, waiting for reply',
  'waiting-list': 'On waiting list',
  'appointment-booked': 'Appointment booked',
  'in-treatment': 'In treatment',
  declined: 'No place / declined',
}

export const REGIONS = { DE: 'Germany', AT: 'Austria', CH: 'Switzerland', UK: 'United Kingdom', OTHER: 'Another country' }

export function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
