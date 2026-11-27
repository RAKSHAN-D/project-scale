import { useCallback, useState } from 'react'
import { getColdItemsForUser, type ColdItem } from '../../services/adminData'
import { useAdminRequest } from './useAdminRecords'

const addressFields = [
  { name: 'houseNumber', label: 'House number' },
  { name: 'street', label: 'Street' },
  { name: 'area', label: 'Area' },
  { name: 'city', label: 'City' },
  { name: 'district', label: 'District' },
  { name: 'state', label: 'State' },
  { name: 'pincode', label: 'Pincode' },
  { name: 'addressType', label: 'Address type' },
  { name: 'verified', label: 'Verification status' },
]

const educationFields = [
  { name: 'highestQualification', label: 'Highest qualification' },
  { name: 'specialization', label: 'Specialization' },
  { name: 'institution', label: 'Institution' },
  { name: 'graduationYear', label: 'Graduation year' },
]

const sections = [
  { type: 'ADDRESS_RECORD', title: 'Address', fields: addressFields },
  { type: 'EDUCATION_RECORD', title: 'Education', fields: educationFields },
  { type: 'FAMILY_RECORD', title: 'Family', fields: null },
] as const

function displayValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string' && value.trim()) return value
  return 'Not provided'
}

function displayRecordField(name: string, value: unknown) {
  if (name === 'verified' && typeof value === 'boolean') return value ? 'Verified' : 'Unverified'
  return displayValue(value)
}

function FamilyMembers({ data }: { data: ColdItem['data'] }) {
  if (!Array.isArray(data?.members)) return <p>Not provided</p>

  const members = data.members.filter((member): member is Record<string, unknown> =>
    typeof member === 'object' && member !== null && !Array.isArray(member),
  )
  if (members.length === 0) return <p>No family members recorded.</p>

  return (
    <div className="admin-dashboard__table-scroll" tabIndex={0} role="region" aria-label="Recorded family members">
      <table>
        <thead><tr><th scope="col">Name</th><th scope="col">Relationship</th><th scope="col">Dependent</th></tr></thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td>{displayValue(member.name)}</td>
              <td>{displayValue(member.relation)}</td>
              <td>{displayValue(member.dependent)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AdminColdDataDetails({ userId }: { userId: number }) {
  const [activeSection, setActiveSection] = useState<(typeof sections)[number]['type']>('ADDRESS_RECORD')
  const loadRecords = useCallback((signal: AbortSignal) => getColdItemsForUser(userId, signal), [userId])
  const { state, retry } = useAdminRequest(loadRecords)

  return (
    <div className="admin-data__cold-details">
      {state.status === 'loading' && <p role="status">Loading cold data…</p>}
      {state.status === 'error' && (
        <div>
          <p role="alert">{state.message}</p>
          <button className="admin-dashboard__pill" type="button" onClick={retry}>Try again</button>
        </div>
      )}
      {state.status === 'ready' && (
        <>
          <div className="admin-data__cold-tabs" role="group" aria-label="Cold data sections">
            {sections.map(({ type, title }) => (
              <button className="admin-dashboard__pill" key={type} type="button" aria-pressed={type === activeSection} onClick={() => setActiveSection(type)}>
                {title}
              </button>
            ))}
          </div>
          {sections.map(({ type, title, fields }) => {
            const records = state.data.filter((item) => item.type === type)
            return (
              <section key={type} className={`admin-data__cold-section${type === activeSection ? ' admin-data__cold-section--active' : ''}`} aria-label={title}>
                <h3>{title}</h3>
                {records.length === 0 && <p>Not provided</p>}
                {records.map((item) => (
                  <div className="admin-data__cold-record" key={item.id}>
                    <p className="admin-data__cold-record-id">Record #{item.id}</p>
                    {fields ? (
                      <dl>
                        {fields.map(({ name, label }) => (
                          <div key={name}><dt>{label}</dt><dd>{displayRecordField(name, item.data?.[name])}</dd></div>
                        ))}
                      </dl>
                    ) : <FamilyMembers data={item.data} />}
                  </div>
                ))}
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}

export default AdminColdDataDetails
