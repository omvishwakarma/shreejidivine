'use client'

import { useEffect, useState } from 'react'

let pushToast = null
const timers = new Map()

export function adminToast(message, type = 'success') {
  const text = String(message || '').trim()
  if (!text || !pushToast) return
  pushToast({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message: text,
    type: type === 'error' ? 'error' : 'success',
  })
}

export function useAdminToasts(msg, error) {
  useEffect(() => {
    if (msg) adminToast(msg, 'success')
  }, [msg])

  useEffect(() => {
    if (error) adminToast(error, 'error')
  }, [error])
}

export function AdminToastHost() {
  const [items, setItems] = useState([])

  useEffect(() => {
    pushToast = (toast) => {
      setItems((prev) => [...prev.slice(-3), toast])
      const timer = setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toast.id))
        timers.delete(toast.id)
      }, 4200)
      timers.set(toast.id, timer)
    }
    return () => {
      pushToast = null
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  function dismiss(id) {
    const timer = timers.get(id)
    if (timer) clearTimeout(timer)
    timers.delete(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  if (!items.length) return null

  return (
    <div className="admin-toasts" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className={`admin-toast admin-toast--${item.type}`} role="status">
          <p>{item.message}</p>
          <button type="button" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
