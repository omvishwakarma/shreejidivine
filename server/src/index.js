import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import addressRoutes from './routes/addresses.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'

const app = express()
const PORT = process.env.PORT || 5001

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      process.env.PRODUCTION_URL,
      'https://shreejidivinearoma.com',
      'https://www.shreejidivinearoma.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ].filter(Boolean),
    credentials: true,
  })
)
app.use(express.json({ limit: '2mb' }))
app.use(morgan('dev'))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'shreeji-api' })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Server error' })
})

async function start() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shreeji'
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 20000,
  })
  console.log('MongoDB connected')
  app.listen(PORT, () => {
    console.log(`API running on http://127.0.0.1:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server', err)
  process.exit(1)
})
