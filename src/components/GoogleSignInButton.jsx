'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SCRIPT_ID = 'google-gsi-client'
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

function loadGoogleScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'))
  if (window.google?.accounts?.id) return Promise.resolve()

  const existing = document.getElementById(SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google script failed')), {
        once: true,
      })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google script failed'))
    document.head.appendChild(script)
  })
}

export default function GoogleSignInButton({
  onCredential,
  disabled = false,
  label = 'Continue with Google',
}) {
  const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim()
  const callbackRef = useRef(onCredential)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId) return undefined
    let cancelled = false

    loadGoogleScript()
      .then(() => {
        if (cancelled) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response?.credential) {
              setError('Google sign-in was cancelled')
              setBusy(false)
              return
            }
            setBusy(true)
            setError('')
            try {
              await callbackRef.current(response.credential)
            } catch (err) {
              setError(err.message || 'Google sign-in failed')
            } finally {
              setBusy(false)
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        })
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load Google Sign-In')
      })

    return () => {
      cancelled = true
    }
  }, [clientId])

  const onClick = useCallback(() => {
    if (disabled || busy) return
    setError('')

    if (!clientId) {
      setError(
        'Google Sign-In setup pending — add NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env and restart the server.'
      )
      return
    }

    if (!ready || !window.google?.accounts?.id) {
      setError('Google Sign-In is still loading. Try again in a moment.')
      return
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        const skipped =
          notification?.isNotDisplayed?.() ||
          notification?.isSkippedMoment?.() ||
          notification?.isDismissedMoment?.()
        if (!skipped) return

        const host = document.createElement('div')
        host.setAttribute('aria-hidden', 'true')
        host.style.cssText = 'position:fixed;left:-9999px;top:0;width:320px;height:44px;'
        document.body.appendChild(host)
        window.google.accounts.id.renderButton(host, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          width: 320,
        })
        const btn = host.querySelector('[role="button"]')
        if (btn) btn.click()
        else setError('Could not open Google Sign-In. Allow popups and try again.')
        setTimeout(() => host.remove(), 3000)
      })
    } catch {
      setError('Google sign-in failed to open')
    }
  }, [clientId, ready, disabled, busy])

  return (
    <div className={`auth-google${disabled || busy ? ' is-disabled' : ''}`}>
      <button
        type="button"
        className="auth-google-btn"
        onClick={onClick}
        disabled={disabled || busy}
      >
        <span className="auth-google-btn__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#EA4335"
              d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
            />
            <path
              fill="#34A853"
              d="M5.3 14.3A7.5 7.5 0 0 1 5 12c0-.8.1-1.6.4-2.3L2.1 7.2A11 11 0 0 0 1 12c0 1.7.4 3.4 1.1 4.8l3.2-2.5z"
            />
            <path
              fill="#4285F4"
              d="M12 5.2c1.5 0 2.8.5 3.8 1.5l2.8-2.8C17.1 2.2 14.8 1 12 1 8.1 1 4.7 3.2 3.1 6.7l3.3 2.5C7.2 6.9 9.3 5.2 12 5.2z"
            />
            <path
              fill="#FBBC05"
              d="M12 19c-2.7 0-4.9-1.7-5.7-4.1l-3.2 2.5C4.7 20.8 8.1 23 12 23c2.7 0 5-.9 6.7-2.4l-3.1-2.4C14.7 18.7 13.5 19 12 19z"
            />
          </svg>
        </span>
        {busy ? 'Connecting…' : label}
      </button>
      {error ? <p className="auth-error">{error}</p> : null}
    </div>
  )
}
