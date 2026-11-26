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

function adminHeaders() {
  const token = sessionStorage.getItem(authTokenStorageKey)
  if (!token) throw new Error('Your admin session has ended. Log in again.')
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' }
}

async function getAdminList<T>(
  path: '/api/users' | '/api/hot-data',
  isItem: (value: unknown) => value is T,
  signal: AbortSignal,
): Promise<T[]> {
  const response = await fetch(path, {
    headers: adminHeaders(),
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

export async function createAdminUser(input: CreateUserInput) {
  const headers = { ...adminHeaders(), 'Content-Type': 'application/json' }
  let response: Response
  try {
    response = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(input) })
  } catch {
    throw new Error('Could not confirm creation. Check the Users table before trying again.')
  }

  if (response.status === 201) return
  if (response.status === 401) throw new Error('Your admin session has ended. Log in again.')
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
  const items = await getAdminList('/api/hot-data', isHotItem, signal)
  return items.sort((first, second) => first.userId - second.userId || first.id - second.id)
}
