import type { HotItem } from '../../services/adminData'
import AdminRecordTable from './AdminRecordTable'

const fields = [
  { name: 'id', label: 'Item ID' },
  { name: 'userId', label: 'User ID' },
  { name: 'itemKey', label: 'Item Key' },
  { name: 'fullName', label: 'Full name' },
  { name: 'location', label: 'Location' },
] as const

const profileFieldOrder = ['fullName', 'occupation', 'status', 'phone', 'locality', 'ward', 'bloodGroup', 'emergencyContactAvailable']

function fieldLabel(key: string) {
  const label = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim()
  return label ? label[0].toUpperCase() + label.slice(1).toLowerCase() : key
}

function ValueField({ value }: { value: unknown }) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value) && value.length) {
    return <ul>{value.map((entry, index) => <li key={index}><ValueField value={entry} /></li>)}</ul>
  }
  if (value !== null && typeof value === 'object' && Object.keys(value).length) {
    return <ValueFields entries={Object.entries(value)} />
  }
  return typeof value === 'string' || typeof value === 'number' ? String(value) || '—' : '—'
}

function ValueFields({ entries }: { entries: [string, unknown][] }) {
  return (
    <dl>
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{fieldLabel(key)}</dt>
          <dd><ValueField value={value} /></dd>
        </div>
      ))}
    </dl>
  )
}

function HotItemValue({ value }: { value: HotItem['value'] }) {
  const fieldRank = (key: string) => {
    const index = profileFieldOrder.indexOf(key)
    return index === -1 ? profileFieldOrder.length : index
  }
  const entries = Object.entries(value ?? {}).sort(([first], [second]) => fieldRank(first) - fieldRank(second))

  return (
    <div className="admin-data__item-value">
      <h3>Record data</h3>
      {entries.length ? <ValueFields entries={entries} /> : <p>No additional data.</p>}
    </div>
  )
}

function AdminHotItemTable({ records, labelledBy }: { records: HotItem[]; labelledBy: string }) {
  const rows = records.map((item) => ({
    ...item,
    fullName: typeof item.value?.fullName === 'string' ? item.value.fullName : '—',
    location: typeof item.value?.locality === 'string' ? item.value.locality : '—',
  }))

  return (
    <AdminRecordTable
      records={rows}
      fields={fields}
      labelledBy={labelledBy}
      detailsTitle="Hot data item"
      emptyMessage="No hot data items to show."
      recordKey={(item) => item.id}
      recordLabel={(item) => `${item.itemKey} (item ${item.id})`}
      renderDetails={(item) => (
        <>
          <dl><div><dt>Updated at</dt><dd>{item.updatedAt}</dd></div></dl>
          <HotItemValue value={item.value} />
        </>
      )}
    />
  )
}

export default AdminHotItemTable
