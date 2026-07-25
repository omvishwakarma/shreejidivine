import { Router } from 'express'
import { z } from 'zod'
import { Address } from '../models/Address.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

const schema = z.object({
  label: z.string().min(1).default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(3),
  line2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(5),
  isDefault: z.boolean().optional(),
})

router.get('/', authRequired, async (req, res) => {
  const addresses = await Address.find({ user: req.auth.sub }).sort({
    isDefault: -1,
    createdAt: -1,
  })
  res.json({ addresses: addresses.map((a) => a.toJSONSafe()) })
})

router.post('/', authRequired, async (req, res) => {
  try {
    const data = schema.parse(req.body)
    if (data.isDefault) {
      await Address.updateMany({ user: req.auth.sub }, { isDefault: false })
    }
    const count = await Address.countDocuments({ user: req.auth.sub })
    const address = await Address.create({
      user: req.auth.sub,
      ...data,
      line2: data.line2 || '',
      isDefault: data.isDefault ?? count === 0,
    })
    res.status(201).json({ address: address.toJSONSafe() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' })
    }
    res.status(500).json({ error: 'Could not save address' })
  }
})

router.patch('/:id', authRequired, async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.auth.sub })
  if (!address) return res.status(404).json({ error: 'Address not found' })
  if (req.body.isDefault) {
    await Address.updateMany({ user: req.auth.sub }, { isDefault: false })
  }
  Object.assign(address, req.body)
  await address.save()
  res.json({ address: address.toJSONSafe() })
})

router.delete('/:id', authRequired, async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.auth.sub })
  if (!address) return res.status(404).json({ error: 'Address not found' })
  res.json({ ok: true })
})

export default router
