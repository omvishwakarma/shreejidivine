'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthShell from '../../components/AuthShell'

export default function ResetPasswordClient() {
  const router = useRouter()
  const token = useSearchParams().get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
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

  async function onSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!token) nextErrors.password = 'This reset link is invalid or has expired.'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.'
    if (confirm !== password) nextErrors.confirm = 'Passwords do not match.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFieldErrors({ password: data.error || 'Could not reset password.' })
        return
      }
      router.push('/login')
    } catch {
      setFieldErrors({ password: 'Could not reset password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="reset">
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        <div className="auth-field auth-field--password">
          <label htmlFor="password">New password</label>
          <div className="auth-field__control">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              className={fieldErrors.password ? 'is-invalid' : ''}
              onChange={(e) => {
                setPassword(e.target.value)
                clearField('password')
              }}
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
        <div className="auth-field">
          <label htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirm}
            aria-invalid={Boolean(fieldErrors.confirm)}
            className={fieldErrors.confirm ? 'is-invalid' : ''}
            onChange={(e) => {
              setConfirm(e.target.value)
              clearField('confirm')
            }}
          />
          {fieldErrors.confirm ? <p className="auth-field__error">{fieldErrors.confirm}</p> : null}
        </div>
        <button type="submit" className="auth-submit" disabled={loading || !token}>
          {loading ? 'Saving…' : 'Update password'}
        </button>
        {!token ? (
          <p className="auth-field__error">Open the reset link from your email to continue.</p>
        ) : null}
      </form>
      <p className="auth-foot">
        <Link href="/login">Back to sign in</Link>
      </p>
    </AuthShell>
  )
}
