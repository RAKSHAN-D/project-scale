import { useRef, useState, type FormEvent } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import AdminResidentTable from './AdminResidentTable'
import { coldResidents, filterResidents, residentFields, residents, type Resident } from './adminResidents'
import '../../styles/admin-data.css'

const pageSize = 7

function AdminDataPage({ kind }: { kind: 'hot' | 'cold' }) {
  const [records, setRecords] = useState(kind === 'hot' ? residents : coldResidents)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [addError, setAddError] = useState('')
  const addDialog = useRef<HTMLDialogElement>(null)
  const title = kind === 'hot' ? 'Hot-Data Module' : 'Cold-Data Module'
  const filtered = filterResidents(records, search)
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize))
  const firstPageButton = Math.max(1, Math.min(page - 1, lastPage - 2))
  const pages = Array.from({ length: Math.min(3, lastPage) }, (_, index) => firstPageButton + index)
  const offset = (page - 1) * pageSize
  const visibleResidents = filtered.slice(offset, offset + pageSize)

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
    <AdminLayout section={kind}>
      <div className="admin-dashboard__content admin-data">
        <header className="admin-dashboard__header admin-data__header">
          <h1 id="admin-data-title">{title}</h1>
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
          <AdminResidentTable residents={visibleResidents} labelledBy="admin-data-title" />
          <nav className="admin-data__pagination" aria-label="Resident list pages">
            <button className="admin-data__page-arrow" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
            {pages.map((number) => (
              <button key={number} type="button" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => setPage(number)}>
                {number}
              </button>
            ))}
            <button className="admin-data__page-arrow" type="button" aria-label="Next page" disabled={page === lastPage} onClick={() => setPage(page + 1)}>›</button>
          </nav>
          <p className="admin-data__count" role="status">
            {filtered.length ? `Showing ${offset + 1}–${offset + visibleResidents.length} of ${filtered.length} users` : 'Showing 0 users'}
          </p>
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
