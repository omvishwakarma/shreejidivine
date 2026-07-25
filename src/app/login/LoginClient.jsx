'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import '../ecom.css'

export default function LoginClient() {
  const { login } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/profile'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push(next)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ecom-page">
      <ShopNav />
      <div className="ecom-wrap">
        <div className="auth-card">
          <h1 className="ecom-title" style={{ fontSize: '2rem', textAlign: 'center' }}>
            Welcome Back
          </h1>
          <p className="ecom-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>
            Login to checkout, track orders &amp; manage addresses.
          </p>
          <form className="form-stack" onSubmit={onSubmit}>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="btn-sm btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>
          <p className="form-foot">
            New here?{' '}
            <Link href={`/signup${next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''}`}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
