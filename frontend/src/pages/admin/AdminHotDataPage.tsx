import { useRef, useState, type FormEvent } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { createHotItem, getHotItems, getHotItemsForUser } from '../../services/adminData'
import AdminHotItemTable from './AdminHotItemTable'
import AdminIdSearch, { parsePositiveId } from './AdminIdSearch'
import AdminPagination, { getAdminPage } from './AdminPagination'
import { useAdminRecordsByUserId } from './useAdminRecords'
import '../../styles/admin-data.css'

const profileFields = [
  { name: 'fullName', label: 'Full name' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'locality', label: 'Locality' },
  { name: 'ward', label: 'Ward' },
  { name: 'occupation', label: 'Occupation' },
  { name: 'status', label: 'Status' },
  { name: 'bloodGroup', label: 'Blood group' },
] as const

function AdminHotDataPage() {
  const { state, retry, userId, searchByUserId } = useAdminRecordsByUserId(getHotItems, getHotItemsForUser)
  const [page, setPage] = useState(1)
  const [pending, setPending] = useState(false)
  const [createError, setCreateError] = useState('')
  const [notice, setNotice] = useState('')
  const createDialog = useRef<HTMLDialogElement>(null)
  const pagination = getAdminPage(state.status === 'ready' ? state.records.length : 0, page)

  function search(id: number | null) {
    setNotice('')
    setPage(1)
    searchByUserId(id)
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const fields = new FormData(event.currentTarget)
    const targetUserId = parsePositiveId(fields.get('userId'))
    const itemKey = String(fields.get('itemKey') ?? '').trim()
    if (targetUserId === null || !itemKey) {
      setCreateError('Enter a valid user ID and an item key.')
      return
    }

    const value: Record<string, string | boolean> = { emergencyContactAvailable: fields.has('emergencyContactAvailable') }
    for (const { name } of profileFields) {
      const text = String(fields.get(name) ?? '').trim()
      if (text) value[name] = text
    }

    setPending(true)
    setCreateError('')
    try {
      await createHotItem({ userId: targetUserId, itemKey, value })
      createDialog.current?.close()
      setNotice(`Hot data item created for user ${targetUserId}.`)
      retry()
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create the hot data item.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AdminLayout section="hot">
      <div className="admin-dashboard__content admin-data">
        <header className="admin-dashboard__header admin-data__header">
          <h1 id="hot-data-heading">Hot-Data Module</h1>
          <div className="admin-data__actions">
            <button type="button" aria-label="Create hot data item" onClick={() => { setNotice(''); createDialog.current?.showModal() }}>
              <span aria-hidden="true">+</span>
            </button>
            <AdminIdSearch userId={userId} onSearch={search} />
          </div>
        </header>

        <section className="admin-data__records" aria-labelledby="hot-data-heading">
          {notice && <p role="status">{notice}</p>}
          {state.status === 'loading' && <p role="status">Loading hot data…</p>}
          {state.status === 'error' && (
            <div>
              <p role="alert">{state.message}</p>
              <button className="admin-dashboard__pill" type="button" onClick={retry}>Try again</button>
            </div>
          )}
          {state.status === 'ready' && (
            <>
              <AdminHotItemTable
                records={state.records.slice(pagination.offset, pagination.end)}
                labelledBy="hot-data-heading"
                emptyMessage={userId === null ? 'No hot data items to show.' : `No hot data items found for user ID ${userId}.`}
              />
              <AdminPagination pagination={pagination} recordLabel="items" onPageChange={setPage} />
            </>
          )}
        </section>
      </div>

      <dialog
        ref={createDialog}
        className="admin-dashboard__details"
        aria-labelledby="create-hot-item-heading"
        onCancel={(event) => { if (pending) event.preventDefault() }}
        onClose={() => {
          createDialog.current?.querySelector('form')?.reset()
          setCreateError('')
        }}
      >
        <h2 id="create-hot-item-heading">Create hot data item</h2>
        <form className="admin-data__add-form" method="post" onSubmit={handleCreate}>
          <fieldset className="admin-data__hot-fields" disabled={pending}>
            <legend>Item details</legend>
            <label>User ID<input name="userId" inputMode="numeric" defaultValue={userId ?? ''} required /></label>
            <label>Item key<input name="itemKey" maxLength={100} required /></label>
          </fieldset>
          <fieldset className="admin-data__hot-fields" disabled={pending}>
            <legend>Profile details</legend>
            {profileFields.map((field) => (
              <label key={field.name}>{field.label}<input name={field.name} type={'type' in field ? field.type : 'text'} /></label>
            ))}
            <label className="admin-data__checkbox"><input type="checkbox" name="emergencyContactAvailable" />Emergency contact available</label>
          </fieldset>
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

export default AdminHotDataPage
