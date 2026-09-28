'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthShell from '../../components/AuthShell'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import { useAuth } from '../../context/AuthContext'

export default function SignupClient() {
  const { signup, loginWithGoogle } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/profile'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function clearField(key) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const nextErrors = { ...prev }
      delete nextErrors[key]
      return nextErrors
    })
  }

  function setValue(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    clearField(key)
  }

  async function onSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name.'
    if (!form.email.trim()) nextErrors.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email.'
    }
    const phoneDigits = form.phone.replace(/\D/g, '')
    if (form.phone.trim() && phoneDigits.length < 10) {
      nextErrors.phone = 'Enter a 10-digit phone number.'
    }
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await signup(form)
      router.push(next)
    } catch (err) {
      const message = err.message || 'Could not create account.'
      if (/email/i.test(message)) setFieldErrors({ email: message })
      else if (/password/i.test(message)) setFieldErrors({ password: message })
      else if (/name/i.test(message)) setFieldErrors({ name: message })
      else setFieldErrors({ email: message })
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = useCallback(
    async (idToken) => {
      setFieldErrors({})
      try {
        await loginWithGoogle(idToken)
        router.push(next)
      } catch (err) {
        setFieldErrors({ email: err.message || 'Could not sign up with Google.' })
      }
    },
    [loginWithGoogle, router, next]
  )

  return (
    <AuthShell mode="signup" next={next}>
      <GoogleSignInButton onCredential={onGoogle} disabled={loading} />
      <div className="auth-divider" role="separator" aria-label="or">
        <span>or</span>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={form.name}
            aria-invalid={Boolean(fieldErrors.name)}
            className={fieldErrors.name ? 'is-invalid' : ''}
            onChange={(e) => setValue('name', e.target.value)}
          />
          {fieldErrors.name ? <p className="auth-field__error">{fieldErrors.name}</p> : null}
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            aria-invalid={Boolean(fieldErrors.email)}
            className={fieldErrors.email ? 'is-invalid' : ''}
            onChange={(e) => setValue('email', e.target.value)}
          />
          {fieldErrors.email ? <p className="auth-field__error">{fieldErrors.email}</p> : null}
        </div>
        <div className="auth-field">
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            aria-invalid={Boolean(fieldErrors.phone)}
            className={fieldErrors.phone ? 'is-invalid' : ''}
            onChange={(e) => setValue('phone', e.target.value)}
          />
          {fieldErrors.phone ? <p className="auth-field__error">{fieldErrors.phone}</p> : null}
        </div>
        <div className="auth-field auth-field--password">
          <label htmlFor="password">Password</label>
          <div className="auth-field__control">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? 'is-invalid' : ''}
              onChange={(e) => setValue('password', e.target.value)}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {fieldErrors.password ? <p className="auth-field__error">{fieldErrors.password}</p> : null}
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-foot">
        Already have an account?{' '}
        <Link href={`/login${next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''}`}>
          Login
        </Link>
      </p>
    </AuthShell>
  )
}
