import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type AdminRecordTableProps<Row> = {
  records: readonly Row[]
  fields: readonly { name: Extract<keyof Row, string>; label: string }[]
  labelledBy: string
  detailsTitle: string | ((record: Row) => string)
  emptyMessage: string
  recordKey: (record: Row) => string | number
  recordLabel: (record: Row) => string
  renderDetails?: (record: Row) => ReactNode
  showSummaryInDetails?: boolean
}

function AdminRecordTable<Row>({
  records, fields, labelledBy, detailsTitle, emptyMessage, recordKey, recordLabel, renderDetails, showSummaryInDetails = true,
}: AdminRecordTableProps<Row>) {
  const [selected, setSelected] = useState<Row | null>(null)
  const details = useRef<HTMLDialogElement>(null)
  const headingId = useId()

  useLayoutEffect(() => {
    const dialog = details.current
    if (selected && dialog && !dialog.open) dialog.showModal()
  }, [selected])

  return (
    <>
      <div className="admin-dashboard__table-scroll" tabIndex={0} role="region" aria-labelledby={labelledBy}>
        <table>
          <thead>
            <tr>
              {fields.map(({ name, label }) => <th key={name} scope="col">{label}</th>)}
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={recordKey(record)}>
                {fields.map(({ name }) => <td key={name}>{String(record[name] ?? '')}</td>)}
                <td>
                  <button className="admin-dashboard__pill" type="button" aria-label={`View ${recordLabel(record)}`} onClick={() => setSelected(record)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && <tr><td colSpan={fields.length + 1}>{emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
      <dialog ref={details} className="admin-dashboard__details" aria-labelledby={headingId} onClose={() => setSelected(null)}>
        <h2 id={headingId}>{typeof detailsTitle === 'string' ? detailsTitle : selected && detailsTitle(selected)}</h2>
        {selected && (
          <>
            {showSummaryInDetails && (
              <dl>
                {fields.map(({ name, label }) => <div key={name}><dt>{label}</dt><dd>{String(selected[name] ?? '')}</dd></div>)}
              </dl>
            )}
            {renderDetails?.(selected)}
          </>
        )}
        <form method="dialog"><button className="admin-dashboard__pill" type="submit">Close</button></form>
      </dialog>
    </>
  )
}

export default AdminRecordTable
