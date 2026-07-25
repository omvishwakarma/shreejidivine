import AdminGuard from '../../../components/admin/AdminGuard'

export default function AdminPanelLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>
}
