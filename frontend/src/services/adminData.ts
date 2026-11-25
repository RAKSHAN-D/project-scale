import { authTokenStorageKey } from './auth'

export type AdminUser = {
  id: number
  username: string
  email: string
  role: string
}

export type HotItem = {
  id: number
  userId: number
  itemKey: string
  updatedAt: string
  value: Record<string, unknown> | null
}

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

async function getAdminList<T>(
  path: '/api/users' | '/api/hot-data',
  isItem: (value: unknown) => value is T,
  signal: AbortSignal,
): Promise<T[]> {
  const token = sessionStorage.getItem(authTokenStorageKey)
  if (!token) throw new Error('Your admin session has ended. Log in again.')

  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    cache: 'no-store',
    signal,
  })

  if (response.status === 401) throw new Error('Your admin session has ended. Log in again.')
  if (response.status === 403) throw new Error('You do not have permission to view these records.')
  if (!response.ok) throw new Error('Could not load records from the backend.')

  const data: unknown = await response.json().catch(() => null)
  if (!Array.isArray(data) || !data.every(isItem)) {
    throw new Error('The backend returned an unexpected response.')
  }

  return data
}

export async function getAdminUsers(signal: AbortSignal) {
  const users = await getAdminList('/api/users', isAdminUser, signal)
  return users.sort((first, second) => first.id - second.id)
}

export async function getHotItems(signal: AbortSignal) {
  const items = await getAdminList('/api/hot-data', isHotItem, signal)
  return items.sort((first, second) => first.userId - second.userId || first.id - second.id)
}
