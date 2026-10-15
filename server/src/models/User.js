import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    // Health data is special-category data (Art. 9 GDPR): store the explicit consent and which text it was given to.
    consent: {
      version: { type: String, required: true },
      acceptedAt: { type: Date, required: true },
    },
    settings: {
      region: { type: String, default: 'DE' },
      // Off by default: the companion only sees a summary of recent check-ins if the user opts in.
      shareContextWithCompanion: { type: Boolean, default: false },
      reminderTime: { type: String, default: '20:00' },
    },
  },
  { timestamps: true },
)

export default mongoose.model('User', userSchema)
