/** Same-origin `/api` (proxied to Express) unless NEXT_PUBLIC_API_URL is set */
const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('shreeji_token') || ''
}

export function setToken(token) {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem('shreeji_token', token)
  else localStorage.removeItem('shreeji_token')
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? 12000
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`)
    }
    return data
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new Error('API timeout — is the server running and MongoDB reachable?')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export { API_URL }
