import path from 'path'
import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import { dbConnect, requireAdmin, requireUser } from '@/lib/mongo/auth'
import { Product } from '@/lib/mongo/Product'
import { normalizeReviews } from '@/lib/productReviews'
import { storeUpload } from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_VIDEO_BYTES = 40 * 1024 * 1024

function safeName(original, fallback) {
  const base = String(original || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const ext = path.extname(base) || ''
  const stem = path.basename(base, ext).slice(0, 40) || fallback
  return `${stem}-${Date.now()}${ext || ''}`
}

async function findProduct(key) {
  if (mongoose.isValidObjectId(key)) {
    return Product.findOne({ $or: [{ _id: key }, { slug: key }] })
  }
  return Product.findOne({ slug: key })
}

async function storeFile(file, kind) {
  const isVideo = kind === 'video'
  const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (!allowed.has(file.type)) {
    throw new Error(isVideo ? 'Only MP4, WEBM, or MOV videos are allowed' : 'Only JPG, PNG, WEBP, or GIF images are allowed')
  }
  if (file.size > maxBytes) {
    throw new Error(isVideo ? 'Video must be under 40MB' : 'Image must be under 5MB')
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const stored = await storeUpload({
    buffer,
    filename: safeName(file.name, isVideo ? 'review-video' : 'review'),
    contentType: file.type,
    kind: isVideo ? 'video' : 'image',
  })
  return stored.url
}

export async function POST(request, { params }) {
  const gate = await requireUser(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { slug } = await params
    const product = await findProduct(slug)
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const pendingCount = (product.reviews || []).filter(
      (review) => review.status === 'pending' && review.userId === gate.auth.sub
    ).length
    if (pendingCount >= 3) {
      return NextResponse.json(
        { error: 'You already have reviews waiting for approval on this product.' },
        { status: 400 }
      )
    }

    const form = await request.formData()
    const imageFiles = form.getAll('images').filter((file) => file && typeof file !== 'string').slice(0, 4)
    const videoFile = form.get('video')
    const images = []
    for (const file of imageFiles) {
      images.push(await storeFile(file, 'image'))
    }
    let video = ''
    if (videoFile && typeof videoFile !== 'string' && videoFile.size) {
      video = await storeFile(videoFile, 'video')
    }

    const [review] = normalizeReviews(
      [
        {
          name: form.get('name') || gate.auth.name || '',
          stars: Number(form.get('stars') || 5),
          text: form.get('text') || '',
          images,
          video,
          instagram: form.get('instagram') || '',
          status: 'pending',
          userId: gate.auth.sub,
        },
      ],
      { defaultStatus: 'pending' }
    )
    if (!review) {
      return NextResponse.json(
        { error: 'Add review text, a photo, a video, or an Instagram link.' },
        { status: 400 }
      )
    }

    product.reviews.push({
      name: review.name,
      stars: review.stars,
      text: review.text,
      images: review.images,
      video: review.video,
      instagram: review.instagram,
      status: 'pending',
      userId: gate.auth.sub,
    })
    await product.save()

    return NextResponse.json({ ok: true, status: 'pending' }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Could not save review' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    await dbConnect()
    const { slug } = await params
    const body = await request.json()
    const status = body.status === 'pending' ? 'pending' : body.status === 'approved' ? 'approved' : ''
    if (!status || !mongoose.isValidObjectId(body.id)) {
      return NextResponse.json({ error: 'Invalid review' }, { status: 400 })
    }
    const product = await findProduct(slug)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    const review = product.reviews.id(body.id)
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }
    review.status = status
    await product.save()
    return NextResponse.json({ ok: true, id: body.id, status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not update review' }, { status: 500 })
  }
}
