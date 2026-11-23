import { useRef, useState } from 'react'
import { authTokenStorageKey } from '../../services/auth'
import '../../styles/admin-dashboard.css'

const residents = [
  { username: 'Rakshan', familyName: 'Doddamani', email: 'rakshan@example.com', location: 'Saptapur' },
  { username: 'Ananya', familyName: 'Kulkarni', email: 'ananya@example.com', location: 'Vidyagiri' },
  { username: 'Kiran', familyName: 'Patil', email: 'kiran@example.com', location: 'Srinagar' },
  { username: 'Meera', familyName: 'Rao', email: 'meera@example.com', location: 'Gandhinagar' },
  { username: 'Vivek', familyName: 'Hegde', email: 'vivek@example.com', location: 'Saptapur' },
  { username: 'Nisha', familyName: 'Desai', email: 'nisha@example.com', location: 'Vidyagiri' },
  { username: 'Arjun', familyName: 'Joshi', email: 'arjun@example.com', location: 'Srinagar' },
  { username: 'Divya', familyName: 'Naik', email: 'divya@example.com', location: 'Gandhinagar' },
]

const metrics = [
  { label: 'Total Population', value: '12,110,996' },
  { label: 'Male Residents', value: '6,987,540' },
  { label: 'Female Residents', value: '5,123,456' },
  { label: 'Recently Added', value: residents[0].username },
]

const localities = [
  { name: 'Saptapur', count: 78 },
  { name: 'Vidyagiri', count: 60 },
  { name: 'Srinagar', count: 45 },
  { name: 'Gandhinagar', count: 30 },
]

const chartTicks = [0, 20, 40, 60, 80]
const chartMax = chartTicks[chartTicks.length - 1]

function AdminDashboardPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<(typeof residents)[number] | null>(null)
  const details = useRef<HTMLDialogElement>(null)
  const query = search.trim().toLowerCase()
  const matchingResidents = residents.filter((resident) =>
    Object.values(resident).some((value) => value.toLowerCase().includes(query)),
  )
  const visibleResidents = showAll || query ? matchingResidents : matchingResidents.slice(0, 6)

  function selectView(allUsers: boolean) {
    setShowAll(allUsers)
    setSearch('')
  }

  function openDetails(resident: (typeof residents)[number]) {
    setSelected(resident)
    details.current?.showModal()
  }

  return (
    <main className={`admin-dashboard${collapsed ? ' admin-dashboard--collapsed' : ''}`}>
      <aside className="admin-dashboard__sidebar" aria-label="Admin sidebar">
        <button
          className="admin-dashboard__toggle"
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          aria-expanded={!collapsed}
          aria-controls="admin-navigation"
          onClick={() => setCollapsed(!collapsed)}
        >
          <span className="admin-dashboard__nav-label">{collapsed ? 'Expand' : 'Minimize'}</span>
          <span className="admin-dashboard__arrow" aria-hidden="true">{collapsed ? '▸' : '◂'}</span>
        </button>
        <nav id="admin-navigation" className="admin-dashboard__nav" aria-label="Admin navigation">
          <button type="button" aria-label="Dashboard" aria-pressed={!showAll} onClick={() => selectView(false)}>
            <span className="admin-dashboard__nav-label">Dashboard</span>
            <span className="admin-dashboard__nav-initial" aria-hidden="true">D</span>
          </button>
          <button type="button" aria-label="Users" aria-pressed={showAll} onClick={() => selectView(true)}>
            <span className="admin-dashboard__nav-label">Users</span>
            <span className="admin-dashboard__nav-initial" aria-hidden="true">U</span>
          </button>
          <button type="button" aria-label="Hot Data" disabled>
            <span className="admin-dashboard__nav-label">Hot Data</span>
            <span className="admin-dashboard__nav-initial" aria-hidden="true">H</span>
          </button>
          <button type="button" aria-label="Cold Data" disabled>
            <span className="admin-dashboard__nav-label">Cold Data</span>
            <span className="admin-dashboard__nav-initial" aria-hidden="true">C</span>
          </button>
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

      <div className="admin-dashboard__content">
        <header className="admin-dashboard__header">
          <input type="search" aria-label="Search registrations" placeholder="Search ..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="admin-dashboard__greeting">
            <h1>Welcome back, Admin</h1>
            <span className="admin-dashboard__avatar" aria-hidden="true">P</span>
          </div>
        </header>

        <dl className="admin-dashboard__metrics" aria-label="Population overview">
          {metrics.map(({ label, value }) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>

        <div className="admin-dashboard__panels">
          <section className="admin-dashboard__panel" aria-labelledby="registrations-heading">
            <div className="admin-dashboard__panel-heading">
              <h2 id="registrations-heading">{showAll ? 'All Users' : 'Recent Registrations'}</h2>
              <button className="admin-dashboard__pill" type="button" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'View recent' : 'View all users →'}
              </button>
            </div>
            <div className="admin-dashboard__table-scroll" tabIndex={0} role="region" aria-labelledby="registrations-heading">
              <table>
                <thead><tr>{['Username', 'Family name', 'Email', 'Location', 'Action'].map((heading) => <th key={heading} scope="col">{heading}</th>)}</tr></thead>
                <tbody>
                  {visibleResidents.map((resident) => (
                    <tr key={resident.email}>
                      <td>{resident.username}</td><td>{resident.familyName}</td><td>{resident.email}</td><td>{resident.location}</td>
                      <td><button className="admin-dashboard__pill" type="button" aria-label={`View ${resident.username}`} onClick={() => openDetails(resident)}>View</button></td>
                    </tr>
                  ))}
                  {visibleResidents.length === 0 && <tr><td colSpan={5}>No registrations match your search.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-dashboard__panel admin-dashboard__chart" aria-labelledby="localities-heading">
            <h2 id="localities-heading">Highly Populated Localities</h2>
            <ul className="admin-dashboard__bars">
              {localities.map(({ name, count }) => (
                <li key={name}>
                  <span>{name}</span>
                  <meter min={0} max={chartMax} value={count} aria-label={name}>{count}</meter>
                </li>
              ))}
            </ul>
            <div className="admin-dashboard__chart-axis" aria-hidden="true">
              {chartTicks.map((tick) => <span key={tick}>{tick}</span>)}
            </div>
          </section>
        </div>
      </div>

      <dialog ref={details} className="admin-dashboard__details" aria-labelledby="resident-heading" onClose={() => setSelected(null)}>
        <h2 id="resident-heading">Resident details</h2>
        {selected && (
          <dl>
            <div><dt>Username</dt><dd>{selected.username}</dd></div>
            <div><dt>Family name</dt><dd>{selected.familyName}</dd></div>
            <div><dt>Email</dt><dd>{selected.email}</dd></div>
            <div><dt>Location</dt><dd>{selected.location}</dd></div>
          </dl>
        )}
        <form method="dialog"><button className="admin-dashboard__pill" type="submit">Close</button></form>
      </dialog>
    </main>
  )
}

export default AdminDashboardPage
