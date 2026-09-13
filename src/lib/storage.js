import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'
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

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Persist an uploaded file and return a public URL.
 * Prefers Vercel Blob, then Cloudinary, then local public/ (dev only).
 */
export async function storeUpload({
  buffer,
  filename,
  contentType,
  kind = 'image',
}) {
  const folder = kind === 'video' ? 'videos' : 'images'

  if (hasVercelBlob()) {
    const blob = await put(`${folder}/${filename}`, buffer, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { url: blob.url, provider: 'vercel-blob' }
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
