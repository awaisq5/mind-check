import mongoose from 'mongoose'

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mood: {
      type: String,
      enum: ['good', 'okay', 'low'],
      required: true,
    },
    energy: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    stress: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

export default mongoose.model('CheckIn', checkInSchema)