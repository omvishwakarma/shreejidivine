import { after } from 'next/server'

/**
 * Run WhatsApp work after the HTTP response on Vercel (waitUntil-backed).
 * Falls back to a tracked promise if `after` is unavailable.
 */
export function scheduleWhatsApp(task) {
  const run = async () => {
    try {
      await task()
    } catch (err) {
      console.error('[whatsapp] schedule failed', err?.message || err)
    }
  }

  try {
    after(run)
  } catch {
    void run()
  }
}
