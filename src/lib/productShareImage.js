import { readFile } from 'fs/promises'
import path from 'path'
import { readPrivateBlob } from './storage'
import { SITE_URL } from './site'

export const SHARE_IMAGE_SIZE = { width: 1200, height: 1200 }

export function productImageSrc(product) {
  return String(product?.image || '').trim()
}

export function absoluteProductImageUrl(src) {
  const value = String(src || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`
}

export async function loadProductImageBuffer(src) {
  const value = String(src || '').trim()
  if (!value) return null

  if (value.startsWith('/api/blob')) {
    const pathname = new URL(value, SITE_URL).searchParams.get('pathname') || ''
    const result = await readPrivateBlob(pathname)
    return Buffer.from(await new Response(result.stream).arrayBuffer())
  }

  if (value.startsWith('/')) {
    try {
      return await readFile(path.join(process.cwd(), 'public', value.replace(/^\/+/, '')))
    } catch {
      const res = await fetch(`${SITE_URL}${value}`)
      if (!res.ok) return null
      return Buffer.from(await res.arrayBuffer())
    }
  }

  if (/^https?:\/\//i.test(value)) {
    const res = await fetch(value)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  }

  return null
}

export async function productShareJpeg(src) {
  const input = await loadProductImageBuffer(src)
  if (!input) return null
  const sharp = (await import('sharp')).default
  return sharp(input)
    .rotate()
    .resize(SHARE_IMAGE_SIZE.width, SHARE_IMAGE_SIZE.height, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer()
}
