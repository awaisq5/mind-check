import mongoose from 'mongoose'

const list = { type: [{ type: String, trim: true, maxlength: 300 }], default: [] }
const contacts = { type: [{ name: { type: String, trim: true, maxlength: 80 }, phone: { type: String, trim: true, maxlength: 40 } }], default: [] }

// Follows the structure of the Stanley-Brown safety planning intervention.
const safetyPlanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    warningSigns: list,
    copingStrategies: list,
    distractions: list,
    supportPeople: contacts,
    professionals: contacts,
    safeEnvironment: list,
    reasonsToLive: list,
  },
  { timestamps: true },
)

export default mongoose.model('SafetyPlan', safetyPlanSchema)
