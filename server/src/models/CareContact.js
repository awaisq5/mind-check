import mongoose from 'mongoose'

export const CONTACT_KINDS = ['psychotherapist', 'gp', 'psychiatrist', 'clinic', 'counselling', 'other']
export const CONTACT_STATUSES = ['to-contact', 'contacted', 'waiting-list', 'appointment-booked', 'in-treatment', 'declined']

// One practice, clinic or professional the user is trying to get care from:
// the waiting-list search that "bridge to care" is about.
const careContactSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    kind: { type: String, enum: CONTACT_KINDS, default: 'psychotherapist' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    email: { type: String, trim: true, maxlength: 120, default: '' },
    status: { type: String, enum: CONTACT_STATUSES, default: 'to-contact' },
    lastContactOn: { type: String, default: null },
    followUpOn: { type: String, default: null },
    appointmentAt: { type: Date, default: null },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('CareContact', careContactSchema)
