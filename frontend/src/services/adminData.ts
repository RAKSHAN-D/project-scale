import { authTokenStorageKey } from './auth'

export type AdminUser = {
  id: number
  username: string
  email: string
  role: string
}

type CreateUserInput = {
  username: string
  email: string
  password: string
}

export type HotItem = {
  id: number
  userId: number
  itemKey: string
  updatedAt: string
  value: Record<string, unknown> | null
}

type CreateHotItemInput = {
  userId: number
  itemKey: string
  value: Record<string, string | boolean>
}

export type ColdDataSummary = {
  userId: number
  name: string
  locality: string | null
  highestQualification: string | null
  recordedFamilyMembers: number | null
}

type ColdDataSummaryPage = {
  records: ColdDataSummary[]
  page: number
  size: number
  total: number
}

export type ColdItem = {
  id: number
  userId: number
  type: string
  createdAt: string
  data: Record<string, unknown> | null
}

type AdminReadPath = '/api/users' | `/api/users/${number}` | '/api/hot-data' | `/api/hot-data/user/${number}`
  | `/api/cold-data/summary?${string}` | `/api/cold-data/user/${number}`

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isAdminUser(value: unknown): value is AdminUser {
  return isRecord(value) && Number.isSafeInteger(value.id) && typeof value.username === 'string'
    && typeof value.email === 'string' && typeof value.role === 'string'
}

function isHotItem(value: unknown): value is HotItem {
  return isRecord(value) && Number.isSafeInteger(value.id) && Number.isSafeInteger(value.userId)
    && typeof value.itemKey === 'string' && typeof value.updatedAt === 'string'
    && (value.value === null || isRecord(value.value))
}

function isColdDataSummary(value: unknown): value is ColdDataSummary {
  return isRecord(value) && Number.isSafeInteger(value.userId) && typeof value.name === 'string'
    && (value.locality === null || typeof value.locality === 'string')
    && (value.highestQualification === null || typeof value.highestQualification === 'string')
    && (value.recordedFamilyMembers === null || Number.isSafeInteger(value.recordedFamilyMembers))
}

function isColdItem(value: unknown): value is ColdItem {
  return isRecord(value) && Number.isSafeInteger(value.id) && Number.isSafeInteger(value.userId)
    && typeof value.type === 'string' && typeof value.createdAt === 'string'
    && (value.data === null || isRecord(value.data))
}

function adminHeaders() {
  const token = sessionStorage.getItem(authTokenStorageKey)
  if (!token) throw new Error('Your admin session has ended. Log in again.')
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

async function getAdminResponse(path: AdminReadPath, signal: AbortSignal) {
  const response = await fetch(path, {
    headers: adminHeaders(),
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) throw new Error('Your admin session has ended. Log in again.')
  if (response.status === 403) throw new Error('You do not have permission to view these records.')
  return response
}

async function readAdminList<T>(response: Response, isItem: (value: unknown) => value is T): Promise<T[]> {
  if (!response.ok) throw new Error('Could not load records from the backend.')

  const data: unknown = await response.json().catch(() => null)
  if (!Array.isArray(data) || !data.every(isItem)) {
    throw new Error('The backend returned an unexpected response.')
  }

  return data
}

export async function getAdminUsers(signal: AbortSignal) {
  const users = await readAdminList(await getAdminResponse('/api/users', signal), isAdminUser)
  return users.sort((first, second) => first.id - second.id)
}

export async function getAdminUserById(userId: number, signal: AbortSignal): Promise<AdminUser[]> {
  const response = await getAdminResponse(`/api/users/${userId}`, signal)
  if (response.status === 404) return []
  if (!response.ok) throw new Error('Could not load the user from the backend.')

  const user: unknown = await response.json().catch(() => null)
  if (!isAdminUser(user)) throw new Error('The backend returned an unexpected response.')
  return [user]
}

async function postAdminRecord(path: '/api/users' | '/api/hot-data', input: CreateUserInput | CreateHotItemInput, table: string) {
  const headers = { ...adminHeaders(), 'Content-Type': 'application/json' }
  let response: Response
  try {
    response = await fetch(path, { method: 'POST', headers, body: JSON.stringify(input) })
  } catch {
    throw new Error(`Could not confirm creation. Check the ${table} table before trying again.`)
  }

  if (response.status === 401) throw new Error('Your admin session has ended. Log in again.')
  return response
}

export async function createAdminUser(input: CreateUserInput) {
  const response = await postAdminRecord('/api/users', input, 'Users')
  if (response.status === 201) return
  if (response.status === 403) throw new Error('Only admins can create users.')

  if (response.status === 400 || response.status === 409) {
    const error: unknown = await response.json().catch(() => null)
    if (isRecord(error)) {
      if (isRecord(error.fieldErrors)) {
        const fieldError = Object.values(error.fieldErrors).find((value) => typeof value === 'string')
        if (fieldError) throw new Error(fieldError)
      }
      if (error.message === 'Username already exists.') throw new Error('That username is already taken.')
      if (error.message === 'Email already exists.') throw new Error('An account already uses that email.')
    }
    if (response.status === 409) throw new Error('That username or email is already in use.')
    throw new Error('Check the username, email, and password and try again.')
  }

  throw new Error('Could not create the user. Try again.')
}

export async function getHotItems(signal: AbortSignal) {
  const items = await readAdminList(await getAdminResponse('/api/hot-data', signal), isHotItem)
  return items.sort((first, second) => first.userId - second.userId || first.id - second.id)
}

export async function getHotItemsForUser(userId: number, signal: AbortSignal) {
  const response = await getAdminResponse(`/api/hot-data/user/${userId}`, signal)
  if (response.status === 404) return []
  const items = await readAdminList(response, isHotItem)
  return items.sort((first, second) => first.id - second.id)
}

export async function getColdDataSummaries(page: number, size: number, search: string, signal: AbortSignal): Promise<ColdDataSummaryPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size), search })
  const response = await getAdminResponse(`/api/cold-data/summary?${params}`, signal)
  if (!response.ok) throw new Error('Could not load cold data summaries from the backend.')

  const data: unknown = await response.json().catch(() => null)
  if (!isRecord(data) || data.page !== page || data.size !== size
    || typeof data.total !== 'number' || !Number.isSafeInteger(data.total) || data.total < 0
    || !Array.isArray(data.records) || !data.records.every(isColdDataSummary)) {
    throw new Error('The backend returned an unexpected cold data summary.')
  }

  return { records: data.records, page, size, total: data.total }
}

export async function getColdItemsForUser(userId: number, signal: AbortSignal) {
  const response = await getAdminResponse(`/api/cold-data/user/${userId}`, signal)
  if (response.status === 404) return []
  return readAdminList(response, isColdItem)
}

export async function createHotItem(input: CreateHotItemInput) {
  const response = await postAdminRecord('/api/hot-data', input, 'Hot Data')
  if (response.status === 201) return
  if (response.status === 403) throw new Error('You do not have permission to create hot data.')
  if (response.status === 404) throw new Error('No user was found with that ID.')

  if (response.status === 400 || response.status === 409) {
    const error: unknown = await response.json().catch(() => null)
    if (response.status === 409 || (isRecord(error) && error.message === 'This user already has an item with this key.')) {
      throw new Error('This user already has a hot data item with that key.')
    }
    throw new Error('Check the user ID, item key, and profile fields and try again.')
  }

  throw new Error('Could not create the hot data item. Try again.')
}
