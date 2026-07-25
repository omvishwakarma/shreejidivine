import { Router } from 'express'
import { z } from 'zod'
import { User } from '../models/User.js'
import { signToken, authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      phone: z.string().optional().or(z.literal('')),
    })
    const data = schema.parse(req.body)
    const exists = await User.findOne({ email: data.email.toLowerCase() })
    if (exists) return res.status(409).json({ error: 'Email already registered' })

    const user = await User.create({
      name: data.name.trim(),
      email: data.email.toLowerCase(),
      passwordHash: await User.hashPassword(data.password),
      phone: data.phone || '',
      role: 'user',
    })

    const token = signToken(user)
    res.status(201).json({ user: user.toSafeJSON(), token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' })
    }
    console.error(err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    const data = schema.parse(req.body)
    const user = await User.findOne({ email: data.email.toLowerCase() })
    if (!user || !(await user.comparePassword(data.password))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const token = signToken(user)
    res.json({ user: user.toSafeJSON(), token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' })
    }
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authRequired, async (req, res) => {
  const user = await User.findById(req.auth.sub)
  if (!user) return res.status(401).json({ error: 'User not found' })
  res.json({ user: user.toSafeJSON() })
})

export default router
