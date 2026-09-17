import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { get, put } from '@vercel/blob'
import { v2 as cloudinary } from 'cloudinary'

function hasVercelBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function hasCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export function hasCloudStorage() {
  return hasVercelBlob() || hasCloudinary()
}

export function isEphemeralFilesystem() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
}

/** `public` | `private` | `` (auto: try public, fall back to private) */
function configuredBlobAccess() {
  const value = String(process.env.BLOB_ACCESS || '').toLowerCase()
  if (value === 'public' || value === 'private') return value
  return ''
}

function isPrivateStoreError(err) {
  const msg = String(err?.message || err || '')
  return /private store|public access on a private/i.test(msg)
}

function proxyUrlForPathname(pathname) {
  return `/api/blob?pathname=${encodeURIComponent(pathname)}`
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

async function putToVercelBlob(pathname, buffer, contentType, access) {
  return put(pathname, buffer, {
    access,
    contentType,
    addRandomSuffix: false,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
}

/**
 * Persist an uploaded file and return a public URL.
 * Prefers Vercel Blob, then Cloudinary, then local public/ (dev only).
 *
 * Product images need browser-readable URLs. If the Blob store is private,
 * we upload with access:private and return a same-origin `/api/blob` proxy URL.
 */
export async function storeUpload({
  buffer,
  filename,
  contentType,
  kind = 'image',
}) {
  const folder = kind === 'video' ? 'videos' : 'images'
  const pathname = `${folder}/${filename}`

  if (hasVercelBlob()) {
    const preferred = configuredBlobAccess()
    const order =
      preferred === 'private'
        ? ['private']
        : preferred === 'public'
          ? ['public']
          : ['public', 'private']

    let lastError
    for (const access of order) {
      try {
        const blob = await putToVercelBlob(pathname, buffer, contentType, access)
        if (access === 'private') {
          return {
            url: proxyUrlForPathname(blob.pathname || pathname),
            pathname: blob.pathname || pathname,
            provider: 'vercel-blob-private',
          }
        }
        return { url: blob.url, provider: 'vercel-blob' }
      } catch (err) {
        lastError = err
        if (access === 'public' && isPrivateStoreError(err) && order.includes('private')) {
          continue
        }
        throw err
      }
    }
    throw lastError
  }

  if (hasCloudinary()) {
    configureCloudinary()
    const resourceType = kind === 'video' ? 'video' : 'image'
    const uploaded = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `shreeji/${folder}`,
          public_id: path.parse(filename).name,
          resource_type: resourceType,
          overwrite: false,
        },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
      stream.end(buffer)
    })
    return { url: uploaded.secure_url, provider: 'cloudinary' }
  }

  if (isEphemeralFilesystem()) {
    const err = new Error(
      'File uploads need cloud storage on production. Add BLOB_READ_WRITE_TOKEN (Vercel Blob) or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in environment variables.'
    )
    err.code = 'NO_CLOUD_STORAGE'
    throw err
  }

  const dir =
    kind === 'video'
      ? path.join(process.cwd(), 'public', 'videos', 'uploads')
      : path.join(process.cwd(), 'public', 'images', 'uploads')
  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, filename), buffer)
  const url =
    kind === 'video' ? `/videos/uploads/${filename}` : `/images/uploads/${filename}`
  return { url, provider: 'local' }
}

/**
 * Stream a private Vercel Blob by pathname (used by /api/blob).
 */
export async function readPrivateBlob(pathname) {
  if (!pathname || pathname.includes('..') || pathname.startsWith('/')) {
    const err = new Error('Invalid pathname')
    err.code = 'INVALID_PATH'
    throw err
  }
  const result = await get(pathname, {
    access: 'private',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  })
  if (!result?.stream) {
    const err = new Error('Blob not found')
    err.code = 'NOT_FOUND'
    throw err
  }
  return result
}
