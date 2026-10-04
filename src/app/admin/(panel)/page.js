'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminApi, formatINR } from '../../../lib/adminApi'

function formatCount(n) {
  return new Intl.NumberFormat('en-IN').format(Math.round(n || 0))
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds || 0))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  if (mins <= 0) return `${secs}s`
  return `${mins}m ${secs}s`
}

function AnalyticsPanel() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi('/api/admin/analytics')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  const peak = Math.max(1, ...(data?.days || []).map((day) => day.users))

  return (
    <section className="admin-analytics">
      <div className="admin-card__head">
        <div>
          <h2>Website visits</h2>
          <p>Google Analytics · {data?.range || 'Last 28 days'}</p>
        </div>
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      {!data && !error ? <p className="admin-page-sub">Loading visits…</p> : null}
      {data ? (
        <>
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span>Visitors</span>
              <strong>{formatCount(data.totals.users)}</strong>
            </div>
            <div className="admin-stat-card">
              <span>New visitors</span>
              <strong>{formatCount(data.totals.newUsers)}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Sessions</span>
              <strong>{formatCount(data.totals.sessions)}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Page views</span>
              <strong>{formatCount(data.totals.pageViews)}</strong>
            </div>
          </div>
          <p className="admin-analytics__meta">
            Engagement {Math.round((data.totals.engagementRate || 0) * 100)}% · Average session{' '}
            {formatDuration(data.totals.avgSessionSeconds)}
          </p>
          <div className="admin-analytics__grid">
            <div className="admin-card">
              <h2>Visitors by day</h2>
              {data.days.length === 0 ? (
                <p className="admin-page-sub">No visits in this period yet.</p>
              ) : (
                <div className="admin-bars">
                  {data.days.map((day) => (
                    <div className="admin-bars__row" key={day.date}>
                      <span>{day.date}</span>
                      <div className="admin-bars__track">
                        <div style={{ width: `${Math.max(4, (day.users / peak) * 100)}%` }} />
                      </div>
                      <strong>{formatCount(day.users)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="admin-card">
              <h2>Where they came from</h2>
              {data.channels.length === 0 ? (
                <p className="admin-page-sub">No traffic sources yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Source</th>
                      <th>Sessions</th>
                      <th>Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.channels.map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{formatCount(row.sessions)}</td>
                        <td>{formatCount(row.users)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {data.devices.length > 0 ? (
                <p className="admin-analytics__meta">
                  {data.devices
                    .map((row) => `${row.name.charAt(0).toUpperCase()}${row.name.slice(1)} ${formatCount(row.users)}`)
                    .join(' · ')}
                </p>
              ) : null}
            </div>
          </div>
          <div className="admin-card">
            <h2>Top pages</h2>
            {data.pages.length === 0 ? (
              <p className="admin-page-sub">No page views yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Views</th>
                    <th>Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pages.map((row) => (
                    <tr key={row.path}>
                      <td>
                        <div>{row.title && row.title !== '(not set)' ? row.title : row.path}</div>
                        <div className="admin-analytics__path">{row.path}</div>
                      </td>
                      <td>{formatCount(row.views)}</td>
                      <td>{formatCount(row.users)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default function AdminDashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi('/api/admin/stats')
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <p className="admin-error">{error}</p>
  if (!data) return <p className="admin-page-sub">Loading dashboard…</p>

  const { stats, recentOrders } = data

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-sub">Overview of your Shreeji Divine store</p>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span>Revenue</span>
          <strong>{formatINR(stats.revenue)}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Orders</span>
          <strong>{stats.orders}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Products</span>
          <strong>{stats.products}</strong>
        </div>
        <div className="admin-stat-card">
          <span>Customers</span>
          <strong>{stats.users}</strong>
        </div>
      </div>

      <AnalyticsPanel />

      <div className="admin-card">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="admin-page-sub">No orders yet</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href="/admin/orders">{o.orderNumber}</Link>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td>{formatINR(o.total)}</td>
                  <td>
                    <span className="admin-badge">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
