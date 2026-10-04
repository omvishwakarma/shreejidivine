import { readFileSync } from 'fs'
import path from 'path'
import { SignJWT, importPKCS8 } from 'jose'

const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'

let tokenCache = { token: '', exp: 0 }
let reportCache = { at: 0, data: null }

function account() {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      throw new Error('GA4 service account JSON is not valid')
    }
  }
  const file = process.env.GA4_SERVICE_ACCOUNT_PATH || 'shreejidivinearoma-797fd92d8c20.json'
  const full = path.isAbsolute(file) ? file : path.join(process.cwd(), file)
  return JSON.parse(readFileSync(full, 'utf8'))
}

async function accessToken() {
  if (tokenCache.token && Date.now() < tokenCache.exp - 60_000) return tokenCache.token
  const creds = account()
  const key = await importPKCS8(creds.private_key, 'RS256')
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(creds.client_email)
    .setSubject(creds.client_email)
    .setAudience(TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Google sign-in for Analytics failed')
  }
  tokenCache = { token: data.access_token, exp: Date.now() + (Number(data.expires_in) || 3600) * 1000 }
  return tokenCache.token
}

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function rowsOf(report) {
  return report?.rows || []
}

function metricMap(report) {
  const names = (report?.metricHeaders || []).map((h) => h.name)
  const values = rowsOf(report)[0]?.metricValues || []
  const out = {}
  names.forEach((name, i) => {
    out[name] = num(values[i]?.value)
  })
  return out
}

function dimRows(report) {
  const dims = (report?.dimensionHeaders || []).map((h) => h.name)
  const metrics = (report?.metricHeaders || []).map((h) => h.name)
  return rowsOf(report).map((row) => {
    const item = {}
    dims.forEach((name, i) => {
      item[name] = row.dimensionValues?.[i]?.value || ''
    })
    metrics.forEach((name, i) => {
      item[name] = num(row.metricValues?.[i]?.value)
    })
    return item
  })
}

function labelDate(yyyymmdd) {
  if (!/^\d{8}$/.test(yyyymmdd)) return yyyymmdd
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00`)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

async function batch(propertyId, requests) {
  const token = await accessToken()
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.error?.message || 'Analytics request failed'
    if (res.status === 403) {
      throw new Error(
        'Analytics access is missing. In Google Analytics, open Admin → Property access management and add analytics-reader@shreejidivinearoma.iam.gserviceaccount.com as Viewer.',
      )
    }
    throw new Error(message)
  }
  return data.reports || []
}

export async function getGa4Dashboard() {
  if (reportCache.data && Date.now() - reportCache.at < 10 * 60 * 1000) return reportCache.data
  const propertyId = process.env.GA4_PROPERTY_ID || '557328186'
  const range = [{ startDate: '28daysAgo', endDate: 'today' }]
  const [summary, daily, pages, channels, devices] = await batch(propertyId, [
    {
      dateRanges: range,
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'engagementRate' },
        { name: 'averageSessionDuration' },
      ],
    },
    {
      dateRanges: range,
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    },
    {
      dateRanges: range,
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 8,
    },
    {
      dateRanges: range,
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 8,
    },
    {
      dateRanges: range,
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
    },
  ])

  const totals = metricMap(summary)
  const days = dimRows(daily).map((row) => ({
    date: labelDate(row.date),
    users: row.activeUsers,
    sessions: row.sessions,
  }))
  const data = {
    range: 'Last 28 days',
    totals: {
      users: totals.activeUsers || 0,
      newUsers: totals.newUsers || 0,
      sessions: totals.sessions || 0,
      pageViews: totals.screenPageViews || 0,
      engagementRate: totals.engagementRate || 0,
      avgSessionSeconds: totals.averageSessionDuration || 0,
    },
    days,
    pages: dimRows(pages).map((row) => ({
      path: row.pagePath,
      title: row.pageTitle,
      views: row.screenPageViews,
      users: row.activeUsers,
    })),
    channels: dimRows(channels).map((row) => ({
      name: row.sessionDefaultChannelGroup || 'Unassigned',
      sessions: row.sessions,
      users: row.activeUsers,
    })),
    devices: dimRows(devices).map((row) => ({
      name: row.deviceCategory || 'unknown',
      users: row.activeUsers,
      sessions: row.sessions,
    })),
  }
  reportCache = { at: Date.now(), data }
  return data
}
