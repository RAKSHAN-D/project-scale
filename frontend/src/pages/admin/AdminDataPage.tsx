import { useRef, useState, type FormEvent } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AdminPagination, { getAdminPage } from './AdminPagination'
import AdminResidentTable from './AdminResidentTable'
import { coldResidents, filterResidents, residentFields, type Resident } from './adminResidents'
import '../../styles/admin-data.css'

function AdminDataPage() {
  const [records, setRecords] = useState(coldResidents)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addError, setAddError] = useState('')
  const addDialog = useRef<HTMLDialogElement>(null)
  const filteredResidents = filterResidents(records, search)
  const pagination = getAdminPage(filteredResidents.length, page)

  function updateSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function toggleSearch() {
    if (searchOpen) updateSearch('')
    setSearchOpen(!searchOpen)
  }

  function addResident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fields = new FormData(form)
    const resident = Object.fromEntries(residentFields.map(({ name }) => [name, String(fields.get(name) ?? '').trim()])) as Resident

    if (residentFields.some(({ name }) => !resident[name])) {
      setAddError('Complete all four fields.')
      return
    }

    if (records.some(({ email }) => email.toLowerCase() === resident.email.toLowerCase())) {
      setAddError('A resident with this email already exists in this list.')
      return
    }

    setRecords((previous) => [resident, ...previous])
    updateSearch('')
    form.reset()
    addDialog.current?.close()
  }

  return (
    <AdminLayout section="cold">
      <div className="admin-dashboard__content admin-data">
        <header className="admin-dashboard__header admin-data__header">
          <h1 id="admin-data-title">Cold-Data Module</h1>
          <div className="admin-data__actions">
            {searchOpen && (
              <input
                type="search"
                aria-label="Search residents"
                placeholder="Search ..."
                value={search}
                onChange={(event) => updateSearch(event.target.value)}
                autoFocus
              />
            )}
            <button type="button" aria-label="Add sample resident" onClick={() => addDialog.current?.showModal()}>
              <span aria-hidden="true">+</span>
            </button>
            <button type="button" aria-label={searchOpen ? 'Close search' : 'Search residents'} aria-expanded={searchOpen} onClick={toggleSearch}>
              <span className="admin-data__search-icon" aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="admin-data__records" aria-labelledby="admin-data-title">
          <AdminResidentTable residents={filteredResidents.slice(pagination.offset, pagination.end)} labelledBy="admin-data-title" />
          <AdminPagination pagination={pagination} recordLabel="users" onPageChange={setPage} />
        </section>
      </div>

      <dialog ref={addDialog} className="admin-dashboard__details" aria-labelledby="add-resident-title" onClose={() => setAddError('')}>
        <h2 id="add-resident-title">Add sample resident</h2>
        <form className="admin-data__add-form" method="post" onSubmit={addResident}>
          {residentFields.map(({ name, label }) => (
            <label key={name}>{label}<input name={name} type={name === 'email' ? 'email' : 'text'} required /></label>
          ))}
          {addError && <p role="alert">{addError}</p>}
          <div className="admin-data__form-actions">
            <button className="admin-dashboard__pill" type="button" onClick={() => addDialog.current?.close()}>Cancel</button>
            <button className="admin-dashboard__pill" type="submit">Add resident</button>
          </div>
        </form>
      </dialog>
    </AdminLayout>
  )
}

export default AdminDataPage
