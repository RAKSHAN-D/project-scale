import { useState } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AdminResidentTable from './AdminResidentTable'
import { filterResidents, residents } from './adminResidents'

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
  const [search, setSearch] = useState('')
  const matchingResidents = filterResidents(residents, search)
  const visibleResidents = search.trim() ? matchingResidents : matchingResidents.slice(0, 6)

  return (
    <AdminLayout section="dashboard">
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
              <h2 id="registrations-heading">Recent Registrations</h2>
              <a className="admin-dashboard__pill" href="/admin?view=users">View all users →</a>
            </div>
            <AdminResidentTable residents={visibleResidents} labelledBy="registrations-heading" />
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
    </AdminLayout>
  )
}

export default AdminDashboardPage
