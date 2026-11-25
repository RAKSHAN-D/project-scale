import AdminRecordTable from './AdminRecordTable'
import { residentFields, type Resident } from './adminResidents'

function AdminResidentTable({ residents, labelledBy }: { residents: Resident[]; labelledBy: string }) {
  return (
    <AdminRecordTable
      records={residents}
      fields={residentFields}
      labelledBy={labelledBy}
      detailsTitle="Resident details"
      emptyMessage="No registrations match your search."
      recordKey={(resident) => resident.email}
      recordLabel={(resident) => resident.username}
    />
  )
}

export default AdminResidentTable
