import { useState, type ReactNode } from 'react'
import { authTokenStorageKey } from '../../services/auth'
import '../../styles/admin-dashboard.css'

const navigation = [
  { section: 'dashboard', label: 'Dashboard', href: '/admin', initial: 'D' },
  { section: 'users', label: 'Users', href: '/admin?view=users', initial: 'U' },
  { section: 'hot', label: 'Hot Data', href: '/admin/hot-data', initial: 'H' },
  { section: 'cold', label: 'Cold Data', href: '/admin/cold-data', initial: 'C' },
] as const

type AdminLayoutProps = {
  section: (typeof navigation)[number]['section']
  children: ReactNode
}

function AdminLayout({ section, children }: AdminLayoutProps) {
  const isDataModule = section === 'hot' || section === 'cold'
  const [collapsed, setCollapsed] = useState(isDataModule)

  return (
    <main className={`admin-dashboard${collapsed ? ' admin-dashboard--collapsed' : ''}`}>
      <aside className="admin-dashboard__sidebar" aria-label="Admin sidebar">
        <button
          className="admin-dashboard__toggle"
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          aria-expanded={!collapsed}
          aria-controls="admin-navigation"
          onClick={() => setCollapsed((wasCollapsed) => !wasCollapsed)}
        >
          <span className="admin-dashboard__nav-label">{collapsed ? 'Expand' : 'Minimize'}</span>
          <span className="admin-dashboard__arrow" aria-hidden="true">{collapsed ? '▸' : '◂'}</span>
        </button>
        <nav id="admin-navigation" className="admin-dashboard__nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <a key={item.section} href={item.href} aria-label={item.label} aria-current={item.section === section ? 'page' : undefined}>
              <span className="admin-dashboard__nav-label">{item.label}</span>
              <span className="admin-dashboard__nav-initial" aria-hidden="true">{item.initial}</span>
            </a>
          ))}
          <button type="button" aria-label="Static Data" disabled>
            <span className="admin-dashboard__nav-label">Static Data</span>
            <span className="admin-dashboard__nav-initial" aria-hidden="true">S</span>
          </button>
        </nav>
        <a className="admin-dashboard__logout" href="/login" aria-label="Log out" onClick={() => sessionStorage.removeItem(authTokenStorageKey)}>
          <span className="admin-dashboard__nav-label">Logout</span>
          <span aria-hidden="true">⏻</span>
        </a>
      </aside>
      {children}
    </main>
  )
}

export default AdminLayout
