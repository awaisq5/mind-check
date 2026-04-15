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
      required: true,
      enum: ['great', 'good', 'okay', 'low'],
    },
    energy: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    stress: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
)

const CheckIn = mongoose.model('CheckIn', checkInSchema)

export default CheckIn