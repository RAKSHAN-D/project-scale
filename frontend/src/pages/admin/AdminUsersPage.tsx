import AdminLayout from '../../components/layout/AdminLayout'
import AdminRecordTable from './AdminRecordTable'
import { residents } from './adminResidents'

const userFields = [
  { name: 'id', label: 'User ID' },
  { name: 'username', label: 'Username' },
  { name: 'email', label: 'Email' },
  { name: 'role', label: 'Role' },
] as const

const users = residents.map(({ username, email }, index) => ({
  id: index + 1,
  username,
  email,
  role: 'SECOND_CLASS',
}))

function AdminUsersPage() {
  return (
    <AdminLayout section="users">
      <div className="admin-dashboard__content">
        <section className="admin-dashboard__panel" aria-labelledby="all-users-heading">
          <div className="admin-dashboard__panel-heading">
            <h1 id="all-users-heading">All Users</h1>
          </div>
          <AdminRecordTable
            records={users}
            fields={userFields}
            labelledBy="all-users-heading"
            detailsTitle="User details"
            emptyMessage="No users to show."
          />
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage
