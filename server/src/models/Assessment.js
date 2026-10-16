import mongoose from 'mongoose'
import { ASSESSMENT_TYPES } from '../domain/assessments.js'

const assessmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ASSESSMENT_TYPES, required: true },
  answers: [{ type: Number, min: 0, max: 3 }],
  difficulty: { type: Number, min: 0, max: 3, default: null },
  score: { type: Number, required: true },
  severity: { type: String, required: true },
  safetyFlag: { type: Boolean, default: false },
  takenAt: { type: Date, default: Date.now },
})

export default mongoose.model('Assessment', assessmentSchema)
