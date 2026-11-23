export const residentFields = [
  { name: 'username', label: 'Username' },
  { name: 'familyName', label: 'Family name' },
  { name: 'email', label: 'Email' },
  { name: 'location', label: 'Location' },
] as const

export type Resident = Record<(typeof residentFields)[number]['name'], string>

export const residents: Resident[] = [
  { username: 'Rakshan', familyName: 'Doddamani', email: 'rakshan@example.com', location: 'Saptapur' },
  { username: 'Ananya', familyName: 'Kulkarni', email: 'ananya@example.com', location: 'Vidyagiri' },
  { username: 'Kiran', familyName: 'Patil', email: 'kiran@example.com', location: 'Srinagar' },
  { username: 'Meera', familyName: 'Rao', email: 'meera@example.com', location: 'Gandhinagar' },
  { username: 'Vivek', familyName: 'Hegde', email: 'vivek@example.com', location: 'Saptapur' },
  { username: 'Nisha', familyName: 'Desai', email: 'nisha@example.com', location: 'Vidyagiri' },
  { username: 'Arjun', familyName: 'Joshi', email: 'arjun@example.com', location: 'Srinagar' },
  { username: 'Divya', familyName: 'Naik', email: 'divya@example.com', location: 'Gandhinagar' },
]

export const coldResidents: Resident[] = [
  { username: 'Riya', familyName: 'Kamat', email: 'riya@example.com', location: 'Saptapur' },
  { username: 'Naveen', familyName: 'Patil', email: 'naveen@example.com', location: 'Vidyagiri' },
  { username: 'Asha', familyName: 'Joshi', email: 'asha@example.com', location: 'Srinagar' },
  { username: 'Ishaan', familyName: 'Naik', email: 'ishaan@example.com', location: 'Gandhinagar' },
  { username: 'Kavya', familyName: 'Desai', email: 'kavya@example.com', location: 'Saptapur' },
  { username: 'Mohan', familyName: 'Rao', email: 'mohan@example.com', location: 'Vidyagiri' },
  { username: 'Priya', familyName: 'Hegde', email: 'priya@example.com', location: 'Srinagar' },
  { username: 'Rohan', familyName: 'Kulkarni', email: 'rohan@example.com', location: 'Gandhinagar' },
]

export function filterResidents(records: Resident[], search: string) {
  const query = search.trim().toLowerCase()
  return records.filter((resident) => Object.values(resident).some((value) => value.toLowerCase().includes(query)))
}

