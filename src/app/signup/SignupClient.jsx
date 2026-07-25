'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import ShopNav from '../../components/ShopNav'
import Footer from '../../components/Footer'
import { useAuth } from '../../context/AuthContext'
import '../ecom.css'

export default function SignupClient() {
  const { signup } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/profile'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form)
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
            Create Account
          </h1>
          <p className="ecom-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>
            Join Shreeji Divine to save addresses and track your orders.
          </p>
          <form className="form-stack" onSubmit={onSubmit}>
            {[
              ['name', 'Full name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone (optional)', 'tel'],
              ['password', 'Password (min 6 chars)', 'password'],
            ].map(([key, label, type]) => (
              <div className="form-field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  type={type}
                  required={key !== 'phone'}
                  minLength={key === 'password' ? 6 : undefined}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            {error ? <p className="form-error">{error}</p> : null}
            <button type="submit" className="btn-sm btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating…' : 'Sign Up'}
            </button>
          </form>
          <p className="form-foot">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
