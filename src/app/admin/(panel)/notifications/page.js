'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '../../../../lib/adminApi'

export default function AdminNotificationsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', url: '/' })

  function load() {
    return adminApi('/api/admin/notifications').then(setData)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setSending(true)
    try {
      const result = await adminApi('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMsg(
        result.message.targeted
          ? `Sent to ${result.message.sent} of ${result.message.targeted} phones`
          : 'No phone has notifications turned on. Open the installed app and allow notifications, then send again.'
      )
      setForm({ title: '', body: '', url: '/' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <h1 className="admin-page-title">Notifications</h1>
      <p className="admin-page-sub">
        Installed app count, and a message to every phone that allowed notifications.
      </p>
      {error ? <p className="admin-error">{error}</p> : null}
      {msg ? <p className="admin-page-sub">{msg}</p> : null}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Apps installed</span>
          <strong>{data ? data.installs : '—'}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Notifications on</span>
          <strong>{data ? data.subscribers : '—'}</strong>
        </div>
      </div>

      <form className="admin-card admin-form-grid" onSubmit={onSubmit}>
        <h2>Send a notification</h2>
        {!data?.ready ? (
          <p className="admin-page-sub">
            Push keys are not on this server yet. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY, then redeploy.
          </p>
        ) : null}
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
            maxLength={80}
            required
          />
        </label>
        <label>
          Message
          <textarea
            rows={3}
            value={form.body}
            onChange={(e) => setForm((current) => ({ ...current, body: e.target.value }))}
            maxLength={180}
            required
          />
        </label>
        <label>
          Open this page
          <input
            value={form.url}
            onChange={(e) => setForm((current) => ({ ...current, url: e.target.value }))}
            placeholder="/shop"
          />
        </label>
        <button type="submit" className="admin-btn admin-btn-primary" disabled={sending || !data?.ready}>
          {sending ? 'Sending…' : 'Send'}
        </button>
      </form>

      <div className="admin-card">
        <h2>Recent sends</h2>
        {!data?.messages?.length ? (
          <p className="admin-page-sub">No notifications sent yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Sent</th>
                <th>Failed</th>
              </tr>
            </thead>
            <tbody>
              {data.messages.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div>{item.title}</div>
                    <div className="admin-analytics__path">{item.body}</div>
                  </td>
                  <td>{item.sent}</td>
                  <td>{item.failed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
