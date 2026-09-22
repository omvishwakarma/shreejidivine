import { createRemoteJWKSet, jwtVerify } from 'jose'

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
)

export function getGoogleClientId() {
  return (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    ''
  ).trim()
}

/**
 * Verify a Google Identity Services ID token and return profile fields.
 */
export async function verifyGoogleIdToken(idToken) {
  const clientId = getGoogleClientId()
  if (!clientId) {
    const err = new Error('Google sign-in is not configured')
    err.status = 503
    throw err
  }

  const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  })

  if (!payload.email || typeof payload.email !== 'string') {
    const err = new Error('Google account has no email')
    err.status = 400
    throw err
  }

  if (payload.email_verified !== true) {
    const err = new Error('Google email is not verified')
    err.status = 401
    throw err
  }

  return {
    googleId: String(payload.sub),
    email: payload.email.toLowerCase(),
    name:
      (typeof payload.name === 'string' && payload.name.trim()) ||
      payload.email.split('@')[0],
    picture: typeof payload.picture === 'string' ? payload.picture : '',
  }
}
