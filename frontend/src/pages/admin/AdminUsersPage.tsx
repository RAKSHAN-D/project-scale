import AdminLayout from '../../components/layout/AdminLayout'
import AdminRecordTable from './AdminRecordTable'
import { getAdminUsers } from '../../services/adminData'
import { useAdminRecords } from './useAdminRecords'

const userFields = [
  { name: 'id', label: 'User ID' },
  { name: 'username', label: 'Username' },
  { name: 'email', label: 'Email' },
  { name: 'role', label: 'Role' },
] as const

function AdminUsersPage() {
  const { state, retry } = useAdminRecords(getAdminUsers)

  return (
    <AdminLayout section="users">
      <div className="admin-dashboard__content">
        <section className="admin-dashboard__panel" aria-labelledby="all-users-heading">
          <div className="admin-dashboard__panel-heading">
            <h1 id="all-users-heading">All Users</h1>
          </div>
          {state.status === 'loading' && <p role="status">Loading users…</p>}
          {state.status === 'error' && (
            <div>
              <p role="alert">{state.message}</p>
              <button className="admin-dashboard__pill" type="button" onClick={retry}>Try again</button>
            </div>
          )}
          {state.status === 'ready' && (
            <AdminRecordTable
              records={state.records}
              fields={userFields}
              labelledBy="all-users-heading"
              detailsTitle="User details"
              emptyMessage="No users to show."
              recordKey={(user) => user.id}
              recordLabel={(user) => user.username}
            />
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage
