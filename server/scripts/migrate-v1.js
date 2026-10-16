// Copies check-ins from the first version of Mind Check into the new format.
//   npm run migrate:v1            (uses MONGO_URI from .env; safe to run twice)
//
// Version 1 stored mood as great/good/okay/low and energy and stress on 1–10,
// with no date field. Version 2 stores one check-in per user per day, every
// value on 1–5. The old collection is left untouched, so nothing is lost.
import 'dotenv/config'
import mongoose from 'mongoose'
import { pathToFileURL } from 'node:url'
import DailyCheckIn from '../src/models/DailyCheckIn.js'
import User from '../src/models/User.js'
import { CONSENT_VERSION } from '../src/validation.js'

const MOOD = { great: 5, good: 4, okay: 3, low: 2 }
const tenToFive = (v) => Math.max(1, Math.min(5, Math.round((Number(v) || 5) / 2)))

export function convert(old) {
  return {
    userId: old.userId,
    date: new Date(old.createdAt).toISOString().slice(0, 10),
    mood: MOOD[String(old.mood).toLowerCase()] ?? 3,
    energy: tenToFive(old.energy),
    anxiety: tenToFive(old.stress),
    note: (old.notes ?? '').slice(0, 1000),
    activities: [],
  }
}

export async function migrate() {
  const old = await mongoose.connection.db.collection('checkins').find({}).sort({ createdAt: 1 }).toArray()
  let copied = 0
  for (const c of old) {
    const doc = convert(c)
    // The last check-in of a day wins, as in version 2.
    const r = await DailyCheckIn.updateOne({ userId: doc.userId, date: doc.date }, { $set: doc }, { upsert: true })
    copied += r.upsertedCount + r.modifiedCount
  }
  // Accounts created before consent was recorded: mark them so the app can ask again.
  const legacy = await User.updateMany({ consent: { $exists: false } }, { $set: { consent: { version: `${CONSENT_VERSION}-legacy`, acceptedAt: new Date(0) } } })
  return { read: old.length, copied, legacyAccounts: legacy.modifiedCount }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await mongoose.connect(process.env.MONGO_URI)
  console.log(await migrate())
  await mongoose.disconnect()
}
