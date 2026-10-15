import mongoose from 'mongoose'

export const ACTIVITY_KEYS = ['exercise', 'outdoors', 'social', 'work', 'meditation', 'alcohol', 'late-screens']

const scale = { type: Number, required: true, min: 1, max: 5 }

const dailyCheckInSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // The user's local calendar date, so "today" means their today.
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    mood: scale,
    energy: scale,
    anxiety: scale,
    sleepHours: { type: Number, min: 0, max: 16, default: null },
    sleepQuality: { type: Number, min: 1, max: 5, default: null },
    activities: [{ type: String, enum: ACTIVITY_KEYS }],
    note: { type: String, trim: true, maxlength: 1000, default: '' },
    // Notes are private unless the user marks them for their appointment report.
    includeInReport: { type: Boolean, default: false },
  },
  { timestamps: true },
)

dailyCheckInSchema.index({ userId: 1, date: 1 }, { unique: true })

export default mongoose.model('DailyCheckIn', dailyCheckInSchema)
