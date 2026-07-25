import { Router } from 'express'
import { z } from 'zod'
import { Product } from '../models/Product.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  const products = await Product.find({ active: true }).sort({ createdAt: 1 })
  res.json({ products: products.map((p) => p.toPublicJSON()) })
})

router.get('/all', adminRequired, async (_req, res) => {
  const products = await Product.find().sort({ createdAt: -1 })
  res.json({ products: products.map((p) => p.toPublicJSON()) })
})

router.get('/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true })
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json({ product: product.toPublicJSON() })
})

router.post('/', adminRequired, async (req, res) => {
  try {
    const schema = z.object({
      slug: z.string().min(2),
      name: z.string().min(2),
      tagline: z.string().optional(),
      price: z.number().min(0),
      compareAt: z.number().nullable().optional(),
      image: z.string().min(1),
      gallery: z.array(z.string()).optional(),
      badge: z.string().nullable().optional(),
      category: z.string().optional(),
      stock: z.number().int().optional(),
      stone: z.string().optional(),
      description: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    })
    const data = schema.parse(req.body)
    const exists = await Product.findOne({ slug: data.slug })
    if (exists) return res.status(409).json({ error: 'Slug already exists' })
    const product = await Product.create(data)
    res.status(201).json({ product: product.toPublicJSON() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Invalid input' })
    }
    res.status(500).json({ error: 'Could not create product' })
  }
})

router.patch('/:id', adminRequired, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json({ product: product.toPublicJSON() })
  } catch (err) {
    res.status(500).json({ error: 'Could not update product' })
  }
})

router.delete('/:id', adminRequired, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ error: 'Product not found' })
  res.json({ ok: true })
})

export default router
