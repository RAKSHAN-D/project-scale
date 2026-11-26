import { useId, useState, type FormEvent } from 'react'

export function parsePositiveId(value: FormDataEntryValue | null) {
  const id = Number(value)
  return typeof value === 'string' && /^\d+$/.test(value.trim()) && Number.isSafeInteger(id) && id > 0 ? id : null
}

function AdminIdSearch({ userId, onSearch }: { userId: number | null; onSearch: (id: number | null) => void }) {
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  function toggleSearch() {
    if (open && userId !== null) onSearch(null)
    setError('')
    setOpen(!open)
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = parsePositiveId(new FormData(event.currentTarget).get('userId'))
    if (id === null) {
      setError('Enter a valid user ID.')
      return
    }

    setError('')
    onSearch(id)
  }

  return (
    <>
      {open && (
        <form id={formId} className="admin-data__id-search" onSubmit={search}>
          <input
            type="search"
            name="userId"
            inputMode="numeric"
            aria-label="User ID"
            placeholder="User ID"
            defaultValue={userId ?? ''}
            onChange={() => setError('')}
            required
            autoFocus
          />
          <button className="admin-dashboard__pill" type="submit">Search</button>
          {error && <small role="alert">{error}</small>}
        </form>
      )}
      <button type="button" aria-label={open ? 'Close search' : 'Search by user ID'} aria-expanded={open} aria-controls={open ? formId : undefined} onClick={toggleSearch}>
        <span className="admin-data__search-icon" aria-hidden="true" />
      </button>
    </>
  )
}

export default AdminIdSearch
