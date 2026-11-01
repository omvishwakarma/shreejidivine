import { NextResponse } from 'next/server'
import { readPrivateBlob } from '@/lib/storage'

export const runtime = 'nodejs'

function clamp(value, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.round(n)))
}

/**
 * Public proxy for private Vercel Blob product media.
 * Image requests are resized to WebP/JPEG so storefront pages stay light.
 */
export async function GET(request) {
  try {
    const pathname = request.nextUrl.searchParams.get('pathname') || ''
    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    const result = await readPrivateBlob(pathname)
    const type = String(result.blob?.contentType || 'application/octet-stream')
    const format = String(request.nextUrl.searchParams.get('fm') || '').toLowerCase()
    const wantsOriginal = format === 'raw' || request.nextUrl.searchParams.get('original') === '1'

    if (!type.startsWith('image/') || wantsOriginal) {
      const headers = new Headers()
      headers.set('Content-Type', type)
      headers.set('Cache-Control', 'public, max-age=31536000, immutable')
      if (result.blob?.size != null) {
        headers.set('Content-Length', String(result.blob.size))
      }
      return new Response(result.stream, { status: 200, headers })
    }

    const width = clamp(request.nextUrl.searchParams.get('w') || 1600, 32, 2400)
    const quality = clamp(request.nextUrl.searchParams.get('q') || 75, 40, 90)
    const input = Buffer.from(await new Response(result.stream).arrayBuffer())
    const sharp = (await import('sharp')).default
    const pipeline = sharp(input, { failOn: 'none' }).rotate().resize({
      width,
      withoutEnlargement: true,
    })

    const useJpeg = format === 'jpeg' || format === 'jpg'
    const body = useJpeg
      ? await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer()
      : await pipeline.webp({ quality }).toBuffer()

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': useJpeg ? 'image/jpeg' : 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(body.length),
      },
    })
  } catch (err) {
    const status =
      err?.code === 'INVALID_PATH' ? 400 : err?.code === 'NOT_FOUND' ? 404 : 500
    console.error('[blob proxy]', err)
    return NextResponse.json(
      { error: err.message || 'Could not load file' },
      { status }
    )
  }
}
