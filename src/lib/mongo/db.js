import mongoose from 'mongoose'

const globalForMongo = globalThis

export async function dbConnect() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!globalForMongo._mongoosePromise) {
    globalForMongo._mongoosePromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      bufferCommands: false,
    })
  }

  await globalForMongo._mongoosePromise
  return mongoose.connection
}
