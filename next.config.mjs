import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_PROXY = process.env.API_PROXY_URL || 'http://127.0.0.1:5001'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${API_PROXY}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
