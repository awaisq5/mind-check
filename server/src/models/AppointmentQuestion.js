import mongoose from 'mongoose'

// Things the user wants to raise at their next appointment.
const appointmentQuestionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('AppointmentQuestion', appointmentQuestionSchema)
