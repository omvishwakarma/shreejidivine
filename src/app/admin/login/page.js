'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminApi, getAdminToken, getAdminUser, setAdminAuth } from '../../../lib/adminApi'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAdminToken() && getAdminUser()?.role === 'admin') {
      router.replace('/admin')
    }
  }, [router])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await adminApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      if (data.user.role !== 'admin') {
        throw new Error('Not an admin account')
      }
      setAdminAuth(data.token, data.user)
      router.replace('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={onSubmit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-transparent.png" alt="Shreeji Divine" className="admin-login-logo" />
        <h1>Admin Login</h1>
        <p className="admin-page-sub">Shreeji Divine — manage store &amp; orders</p>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error ? <p className="admin-error">{error}</p> : null}
          <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}
