import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from './api'

export default function Layout() {
  const navigate = useNavigate()
  const user = getUser()

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-brand">
          SHREEJI
          <small>Admin Panel</small>
        </div>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/orders">Orders</NavLink>
        <NavLink to="/users">Customers</NavLink>
        <div style={{ marginTop: 'auto', padding: '1rem 0.75rem 0', fontSize: '0.8rem', opacity: 0.6 }}>
          {user?.email}
        </div>
        <button
          type="button"
          className="nav-btn"
          onClick={() => {
            clearAuth()
            navigate('/login')
          }}
        >
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
