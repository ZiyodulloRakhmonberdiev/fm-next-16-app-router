import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set')
}

let cached = (global as any)._mongoose
if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'ferganamedia',
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null
        console.error('[db] MongoDB ulanish xatosi:', err.message)
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}