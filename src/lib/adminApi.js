const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export function getAdminToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('shreeji_admin_token') || ''
}

export function setAdminAuth(token, user) {
  localStorage.setItem('shreeji_admin_token', token)
  localStorage.setItem('shreeji_admin_user', JSON.stringify(user))
}

export function clearAdminAuth() {
  localStorage.removeItem('shreeji_admin_token')
  localStorage.removeItem('shreeji_admin_user')
}

export function getAdminUser() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('shreeji_admin_user') || 'null')
  } catch {
    return null
  }
}

export async function adminApi(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getAdminToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export function formatINR(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0)
}
