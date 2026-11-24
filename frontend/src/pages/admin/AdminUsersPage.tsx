import AdminLayout from '../../components/layout/AdminLayout'
import AdminResidentTable from './AdminResidentTable'
import { residents } from './adminResidents'

function AdminUsersPage() {
  return (
    <AdminLayout section="users">
      <div className="admin-dashboard__content">
        <section className="admin-dashboard__panel" aria-labelledby="all-users-heading">
          <div className="admin-dashboard__panel-heading">
            <h1 id="all-users-heading">All Users</h1>
          </div>
          <AdminResidentTable residents={residents} labelledBy="all-users-heading" />
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminUsersPage
