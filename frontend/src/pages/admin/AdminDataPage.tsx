import { useCallback, useState, type FormEvent } from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { getColdDataSummaries } from '../../services/adminData'
import AdminColdDataDetails from './AdminColdDataDetails'
import AdminPagination, { adminPageSize, getAdminPage } from './AdminPagination'
import AdminRecordTable from './AdminRecordTable'
import { useAdminRequest } from './useAdminRecords'
import '../../styles/admin-data.css'

const fields = [
  { name: 'userId', label: 'User ID' },
  { name: 'name', label: 'Name' },
  { name: 'locality', label: 'Locality / City' },
  { name: 'highestQualification', label: 'Highest qualification' },
  { name: 'recordedFamilyMembers', label: 'Recorded family members' },
] as const

function AdminDataPage() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const loadSummary = useCallback(async (signal: AbortSignal) => {
    const result = await getColdDataSummaries(page - 1, adminPageSize, search, signal)
    const currentPage = getAdminPage(result.total, page).page
    return currentPage === page ? result : getColdDataSummaries(currentPage - 1, adminPageSize, search, signal)
  }, [page, search])
  const { state, retry } = useAdminRequest(loadSummary)

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextSearch = String(new FormData(event.currentTarget).get('search') ?? '').trim()
    if (nextSearch === search && page === 1) retry()
    setSearch(nextSearch)
    setPage(1)
  }

  function toggleSearch() {
    if (searchOpen && search) {
      setSearch('')
      setPage(1)
    }
    setSearchOpen(!searchOpen)
  }

  return (
    <AdminLayout section="cold">
      <div className="admin-dashboard__content admin-data">
        <header className="admin-dashboard__header admin-data__header">
          <h1 id="cold-data-heading">Cold-Data Module</h1>
          <div className="admin-data__actions">
            {searchOpen && (
              <form id="cold-data-search" className="admin-data__id-search" onSubmit={submitSearch}>
                <input type="search" name="search" aria-label="User ID or name" placeholder="User ID or name" defaultValue={search} autoFocus />
                <button className="admin-dashboard__pill" type="submit">Search</button>
              </form>
            )}
            <button type="button" aria-label={searchOpen ? 'Close search' : 'Search cold data'} aria-expanded={searchOpen} aria-controls={searchOpen ? 'cold-data-search' : undefined} onClick={toggleSearch}>
              <span className="admin-data__search-icon" aria-hidden="true" />
            </button>
          </div>
        </header>

        <section className="admin-data__records" aria-labelledby="cold-data-heading">
          {state.status === 'loading' && <p role="status">Loading cold data summaries…</p>}
          {state.status === 'error' && (
            <div>
              <p role="alert">{state.message}</p>
              <button className="admin-dashboard__pill" type="button" onClick={retry}>Try again</button>
            </div>
          )}
          {state.status === 'ready' && (
            <>
              <AdminRecordTable
                records={state.data.records.map((record) => ({
                  ...record,
                  locality: record.locality ?? 'Not provided',
                  highestQualification: record.highestQualification ?? 'Not provided',
                  recordedFamilyMembers: record.recordedFamilyMembers ?? 'Not provided',
                }))}
                fields={fields}
                labelledBy="cold-data-heading"
                detailsTitle={(record) => `Cold Data — ${record.name}`}
                emptyMessage={search ? 'No users with cold data match your search.' : 'No users have cold data yet.'}
                recordKey={(record) => record.userId}
                recordLabel={(record) => record.name}
                showSummaryInDetails={false}
                renderDetails={(record) => <AdminColdDataDetails key={record.userId} userId={record.userId} />}
              />
              <AdminPagination pagination={getAdminPage(state.data.total, state.data.page + 1)} recordLabel="users" onPageChange={setPage} />
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminDataPage
