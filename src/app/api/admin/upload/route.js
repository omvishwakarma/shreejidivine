import path from 'path'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/mongo/auth'
import { storeUpload } from '@/lib/storage'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_VIDEO_BYTES = 80 * 1024 * 1024

function safeName(original, fallback = 'file') {
  const base = String(original || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const ext = path.extname(base) || ''
  const stem = path.basename(base, ext).slice(0, 40) || fallback
  return `${stem}-${Date.now()}${ext || ''}`
}

export async function POST(request) {
  const gate = await requireAdmin(request)
  if (gate.error) return gate.error

  try {
    const form = await request.formData()
    const file = form.get('file')
    const kind = String(form.get('kind') || 'image').toLowerCase()

    if (!file || typeof file === 'string' || !file.arrayBuffer) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isVideo = kind === 'video' || VIDEO_TYPES.has(file.type)
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES

    if (!allowed.has(file.type)) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Only MP4, WEBM, or MOV videos are allowed'
            : 'Only JPG, PNG, WEBP, or GIF images are allowed',
        },
        { status: 400 }
      )
    }

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: isVideo
            ? 'Video must be under 80MB'
            : 'Image must be under 5MB',
        },
        { status: 400 }
      )
    }

    const filename = safeName(file.name, isVideo ? 'hero' : 'image')
    const buffer = Buffer.from(await file.arrayBuffer())
    const stored = await storeUpload({
      buffer,
      filename,
      contentType: file.type,
      kind: isVideo ? 'video' : 'image',
    })

    return NextResponse.json({
      url: stored.url,
      filename,
      kind: isVideo ? 'video' : 'image',
      provider: stored.provider,
    })
  } catch (err) {
    console.error('[upload]', err)
    let message = err.message || 'Upload failed'
    if (/private store|public access on a private/i.test(message)) {
      message =
        'Vercel Blob store is private. Redeploy with the latest upload fix, or set BLOB_ACCESS=private. For product photos, a Public Blob store is recommended (Vercel → Storage → Blob).'
    }
    const status = err?.code === 'NO_CLOUD_STORAGE' ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
