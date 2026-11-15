import AdminPwaClient from '../../components/admin/AdminPwaClient'
import './admin.css'

export const metadata = {
  title: {
    default: 'Admin',
    template: '%s · Shreeji Admin',
  },
  applicationName: 'Shreeji Admin',
  robots: { index: false, follow: false },
  manifest: '/admin/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'SD Admin',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/images/logo-app-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/logo-app-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/images/logo-app-192.png', sizes: '192x192' }],
  },
}

export const viewport = {
  themeColor: '#241912',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function AdminRootLayout({ children }) {
  return (
    <div className="admin-root">
      <AdminPwaClient />
      {children}
    </div>
  )
}
