import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  // API runs inside Next.js (Vercel). Do NOT proxy /api to localhost —
  // that only works on your machine and causes 404 on production.
}

export default nextConfig
