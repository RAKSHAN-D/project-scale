const pageSize = 7

export function getAdminPage(count: number, requestedPage: number) {
  const lastPage = Math.max(1, Math.ceil(count / pageSize))
  const page = Math.min(requestedPage, lastPage)
  const offset = (page - 1) * pageSize
  const end = Math.min(offset + pageSize, count)

  return { page, lastPage, offset, end, count }
}

type AdminPaginationProps = {
  pagination: ReturnType<typeof getAdminPage>
  recordLabel: string
  onPageChange: (page: number) => void
}

function AdminPagination({ pagination, recordLabel, onPageChange }: AdminPaginationProps) {
  const { page, lastPage, offset, end, count } = pagination
  const firstPageButton = Math.max(1, Math.min(page - 1, lastPage - 2))
  const pages = Array.from({ length: Math.min(3, lastPage) }, (_, index) => firstPageButton + index)

  return (
    <>
      <nav className="admin-data__pagination" aria-label={`Pages of ${recordLabel}`}>
        <button className="admin-data__page-arrow" type="button" aria-label="Previous page" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {pages.map((number) => (
          <button key={number} type="button" aria-label={`Page ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onPageChange(number)}>
            {number}
          </button>
        ))}
        <button className="admin-data__page-arrow" type="button" aria-label="Next page" disabled={page === lastPage} onClick={() => onPageChange(page + 1)}>›</button>
      </nav>
      <p className="admin-data__count" role="status">
        {count ? `Showing ${offset + 1}–${end} of ${count} ${recordLabel}` : `Showing 0 ${recordLabel}`}
      </p>
    </>
  )
}

export default AdminPagination
