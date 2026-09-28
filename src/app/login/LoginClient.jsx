'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthShell from '../../components/AuthShell'
import GoogleSignInButton from '../../components/GoogleSignInButton'
import { useAuth } from '../../context/AuthContext'

export default function LoginClient() {
  const { login, loginWithGoogle } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/profile'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
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
    if (!email.trim()) nextErrors.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email.'
    if (!password) nextErrors.password = 'Enter your password.'
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    try {
      await login(email, password)
      router.push(next)
    } catch (err) {
      const message = err.message || 'Could not sign in.'
      if (/google/i.test(message)) setFieldErrors({ email: message })
      else setFieldErrors({ password: message })
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
        setFieldErrors({ email: err.message || 'Could not sign in with Google.' })
      }
    },
    [loginWithGoogle, router, next]
  )

  return (
    <AuthShell mode="login" next={next}>
      <GoogleSignInButton onCredential={onGoogle} disabled={loading} />
      <div className="auth-divider" role="separator" aria-label="or">
        <span>or</span>
      </div>

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
              clearField('email')
            }}
          />
          {fieldErrors.email ? <p className="auth-field__error">{fieldErrors.email}</p> : null}
        </div>
        <div className="auth-field auth-field--password">
          <label htmlFor="password">Password</label>
          <div className="auth-field__control">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
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

        <div className="auth-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="auth-forgot">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-foot">
        New here?{' '}
        <Link href={`/signup${next !== '/profile' ? `?next=${encodeURIComponent(next)}` : ''}`}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
