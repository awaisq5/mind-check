import mongoose from 'mongoose'

export async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing')
    }

    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:')
    console.error(error)
    process.exit(1)
  }
}