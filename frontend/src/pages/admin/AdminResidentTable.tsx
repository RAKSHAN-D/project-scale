import { useId, useRef, useState } from 'react'
import { residentFields, type Resident } from './adminResidents'

type AdminResidentTableProps = {
  residents: Resident[]
  labelledBy: string
}

function AdminResidentTable({ residents, labelledBy }: AdminResidentTableProps) {
  const [selected, setSelected] = useState<Resident | null>(null)
  const details = useRef<HTMLDialogElement>(null)
  const headingId = useId()

  function openDetails(resident: Resident) {
    setSelected(resident)
    details.current?.showModal()
  }

  return (
    <>
      <div className="admin-dashboard__table-scroll" tabIndex={0} role="region" aria-labelledby={labelledBy}>
        <table>
          <thead>
            <tr>
              {residentFields.map(({ name, label }) => <th key={name} scope="col">{label}</th>)}
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {residents.map((resident) => (
              <tr key={resident.email}>
                {residentFields.map(({ name }) => <td key={name}>{resident[name]}</td>)}
                <td>
                  <button className="admin-dashboard__pill" type="button" aria-label={`View ${resident.username}`} onClick={() => openDetails(resident)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
            {residents.length === 0 && <tr><td colSpan={residentFields.length + 1}>No registrations match your search.</td></tr>}
          </tbody>
        </table>
      </div>
      <dialog ref={details} className="admin-dashboard__details" aria-labelledby={headingId} onClose={() => setSelected(null)}>
        <h2 id={headingId}>Resident details</h2>
        {selected && (
          <dl>
            {residentFields.map(({ name, label }) => <div key={name}><dt>{label}</dt><dd>{selected[name]}</dd></div>)}
          </dl>
        )}
        <form method="dialog"><button className="admin-dashboard__pill" type="submit">Close</button></form>
      </dialog>
    </>
  )
}

export default AdminResidentTable
