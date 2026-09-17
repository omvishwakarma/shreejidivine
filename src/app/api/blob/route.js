import { NextResponse } from 'next/server'
import { readPrivateBlob } from '@/lib/storage'

export const runtime = 'nodejs'

/**
 * Public proxy for private Vercel Blob product media.
 * Uploads to a private store are saved as `/api/blob?pathname=...`.
 */
export async function GET(request) {
  try {
    const pathname = request.nextUrl.searchParams.get('pathname') || ''
    if (!pathname) {
      return NextResponse.json({ error: 'Missing pathname' }, { status: 400 })
    }

    const result = await readPrivateBlob(pathname)
    const headers = new Headers()
    headers.set('Content-Type', result.blob?.contentType || 'application/octet-stream')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    if (result.blob?.size != null) {
      headers.set('Content-Length', String(result.blob.size))
    }

    return new Response(result.stream, { status: 200, headers })
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
