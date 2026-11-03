'use client'

import { useState } from 'react'
import { api, setToken } from '../lib/api'

export default function WhatsAppAuthForm({
  purpose = 'login',
  onSuccess,
  disabled = false,
}) {
  const [step, setStep] = useState('phone')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [sentPhone, setSentPhone] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOtp(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Enter a valid 10-digit WhatsApp number.')
      return
    }
    if (purpose === 'signup' && name.trim().length < 2) {
      setError('Enter your full name.')
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/auth/whatsapp/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          purpose,
          name: name.trim(),
        }),
      })
      setSentPhone(data.phone || phone)
      setStep('otp')
      setInfo('OTP sent on WhatsApp. Check your messages.')
    } catch (err) {
      setError(err.message || 'Could not send OTP.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (code.replace(/\D/g, '').length < 4) {
      setError('Enter the OTP from WhatsApp.')
      return
    }

    setLoading(true)
    try {
      const data = await api('/api/auth/whatsapp/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone: sentPhone || phone,
          code,
          purpose,
          name: name.trim(),
        }),
      })
      setToken(data.token)
      onSuccess?.(data.user)
    } catch (err) {
      setError(err.message || 'Could not verify OTP.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <form className="auth-form" onSubmit={verifyOtp} noValidate>
        <p className="auth-wa-note">
          Code sent to WhatsApp <strong>+{sentPhone || phone.replace(/\D/g, '')}</strong>
        </p>
        <div className="auth-field">
          <label htmlFor="wa-otp">WhatsApp OTP</label>
          <input
            id="wa-otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            maxLength={8}
            aria-invalid={Boolean(error)}
            className={error ? 'is-invalid' : ''}
            onChange={(e) => {
              setCode(e.target.value)
              setError('')
            }}
            disabled={disabled || loading}
          />
        </div>
        {error ? <p className="auth-field__error">{error}</p> : null}
        {info ? <p className="auth-wa-info">{info}</p> : null}
        <button type="submit" className="auth-submit" disabled={disabled || loading}>
          {loading ? 'Verifying…' : purpose === 'signup' ? 'Verify & create account' : 'Verify & sign in'}
        </button>
        <button
          type="button"
          className="auth-wa-link"
          disabled={disabled || loading}
          onClick={() => {
            setStep('phone')
            setCode('')
            setError('')
            setInfo('')
          }}
        >
          Change number
        </button>
      </form>
    )
  }

  return (
    <form className="auth-form" onSubmit={sendOtp} noValidate>
      {purpose === 'signup' ? (
        <div className="auth-field">
          <label htmlFor="wa-name">Full name</label>
          <input
            id="wa-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            disabled={disabled || loading}
          />
        </div>
      ) : null}
      <div className="auth-field">
        <label htmlFor="wa-phone">WhatsApp number</label>
        <input
          id="wa-phone"
          type="tel"
          autoComplete="tel"
          placeholder="98765 43210"
          value={phone}
          aria-invalid={Boolean(error)}
          className={error ? 'is-invalid' : ''}
          onChange={(e) => {
            setPhone(e.target.value)
            setError('')
          }}
          disabled={disabled || loading}
        />
      </div>
      {error ? <p className="auth-field__error">{error}</p> : null}
      {info ? <p className="auth-wa-info">{info}</p> : null}
      <button type="submit" className="auth-submit auth-submit--wa" disabled={disabled || loading}>
        {loading ? 'Sending OTP…' : 'Continue with WhatsApp'}
      </button>
    </form>
  )
}
