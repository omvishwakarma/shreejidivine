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

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export { API_URL }
