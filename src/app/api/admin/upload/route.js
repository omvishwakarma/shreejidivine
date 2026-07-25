import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/mongo/auth'

export const runtime = 'nodejs'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

function safeName(original) {
  const base = String(original || 'image')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const ext = path.extname(base) || '.png'
  const stem = path.basename(base, ext).slice(0, 40) || 'image'
  return `${stem}-${Date.now()}${ext}`
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    const form = await request.formData()
    const file = form.get('file')

    if (!file || typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, or GIF images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
    }

    const filename = safeName(file.name)
    const dir = path.join(process.cwd(), 'public', 'images', 'uploads')
    await mkdir(dir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(dir, filename), buffer)

    const url = `/images/uploads/${filename}`
    return NextResponse.json({ url, filename })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
