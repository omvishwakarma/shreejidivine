'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthShell from '../../components/AuthShell'

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setFormError('')
    const nextErrors = {}
    if (!email.trim()) nextErrors.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email.'
    }
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data.error || 'Could not send the reset email.')
        return
      }
      setSent(true)
    } catch {
      setFormError('Could not send the reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="forgot">
      {sent ? (
        <>
          <p className="auth-note">
            If an account exists for {email.trim()}, we sent a reset link. It expires in 1 hour.
          </p>
          <p className="auth-foot">
            <Link href="/login">Back to sign in</Link>
          </p>
        </>
      ) : (
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              className={fieldErrors.email ? 'is-invalid' : ''}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldErrors({})
                setFormError('')
              }}
            />
            {fieldErrors.email ? <p className="auth-field__error">{fieldErrors.email}</p> : null}
            {formError ? <p className="auth-field__error">{formError}</p> : null}
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <p className="auth-foot">
            <Link href="/login">Back to sign in</Link>
          </p>
        </form>
      )}
    </AuthShell>
  )
}
