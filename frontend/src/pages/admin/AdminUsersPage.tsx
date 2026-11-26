import { useRef, useState, type FormEvent } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AdminRecordTable from './AdminRecordTable'
import { createAdminUser, getAdminUsers } from '../../services/adminData'
import { useAdminRecords } from './useAdminRecords'
import '../../styles/admin-data.css'

const userFields = [
  { name: 'id', label: 'User ID' },
  { name: 'username', label: 'Username' },
  { name: 'email', label: 'Email' },
  { name: 'role', label: 'Role' },
] as const

function AdminUsersPage() {
  const { state, retry } = useAdminRecords(getAdminUsers)
  const createDialog = useRef<HTMLDialogElement>(null)
  const [pending, setPending] = useState(false)
  const [createError, setCreateError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const fields = new FormData(form)
    const username = String(fields.get('username') ?? '').trim()
    const email = String(fields.get('email') ?? '').trim()
    const password = String(fields.get('password') ?? '').trim()

    if (!username || !email || password.length < 8) {
      setCreateError('Enter a username, email, and a password with at least 8 characters.')
      return
    }
    if (new TextEncoder().encode(password).length > 72) {
      setCreateError('That password is too long. Use fewer characters and try again.')
      return
    }

    setPending(true)
    setCreateError('')
    try {
      await createAdminUser({ username, email, password })
      createDialog.current?.close()
      setNotice('User created.')
      retry()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create the user.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AdminLayout section="users">
      <div className="admin-dashboard__content">
        <section className="admin-dashboard__panel" aria-labelledby="all-users-heading">
          <div className="admin-dashboard__panel-heading">
            <h1 id="all-users-heading">All Users</h1>
            <div className="admin-data__actions">
              <button type="button" aria-label="Create user" onClick={() => { setNotice(''); createDialog.current?.showModal() }}>
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </div>
          {notice && <p role="status">{notice}</p>}
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
      <dialog
        ref={createDialog}
        className="admin-dashboard__details"
        aria-labelledby="create-user-heading"
        onCancel={(event) => { if (pending) event.preventDefault() }}
        onClose={() => {
          createDialog.current?.querySelector('form')?.reset()
          setCreateError('')
        }}
      >
        <h2 id="create-user-heading">Create user</h2>
        <form className="admin-data__add-form" method="post" onSubmit={handleCreate}>
          <label>Username<input name="username" type="text" maxLength={50} required disabled={pending} /></label>
          <label>Email<input name="email" type="email" maxLength={255} required disabled={pending} /></label>
          <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required disabled={pending} /></label>
          {createError && <p role="alert">{createError}</p>}
          <div className="admin-data__form-actions">
            <button className="admin-dashboard__pill" type="button" disabled={pending} onClick={() => createDialog.current?.close()}>Cancel</button>
            <button className="admin-dashboard__pill" type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create'}</button>
          </div>
        </form>
      </dialog>
    </AdminLayout>
  )
}

export default AdminUsersPage
