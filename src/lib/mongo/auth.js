import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import { User } from './User'
import { dbConnect } from './db'

function secretKey() {
  const secret = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'dev-secret'
  return new TextEncoder().encode(secret)
}

export async function signToken(user) {
  return new SignJWT({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey())
}

export async function verifyAuth(request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload
  } catch {
    return null
  }
}

export async function requireUser(request) {
  const auth = await verifyAuth(request)
  if (!auth?.sub) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { auth }
}

export async function requireAdmin(request) {
  const result = await requireUser(request)
  if (result.error) return result
  if (result.auth.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }) }
  }
  return result
}

export function generateOrderNumber() {
  const n = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SD-${n}-${r}`
}

export async function getAuthUser(auth) {
  await dbConnect()
  return User.findById(auth.sub)
}

export { dbConnect }
