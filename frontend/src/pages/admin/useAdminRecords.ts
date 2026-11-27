import { useCallback, useEffect, useState } from 'react'

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; message: string }

export function useAdminRequest<T>(loadRecords: (signal: AbortSignal) => Promise<T>) {
  const [request, setRequest] = useState(0)
  const [result, setResult] = useState<{
    source: typeof loadRecords
    request: number
    state: LoadState<T>
  } | null>(null)
  const state: LoadState<T> = result?.source === loadRecords && result.request === request
    ? result.state
    : { status: 'loading' }

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const data = await loadRecords(controller.signal)
        if (!controller.signal.aborted) setResult({ source: loadRecords, request, state: { status: 'ready', data } })
      } catch (error) {
        if (controller.signal.aborted) return
        const message = error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : 'Could not reach the backend.'
        setResult({ source: loadRecords, request, state: { status: 'error', message } })
      }
    }

    void load()
    return () => controller.abort()
  }, [loadRecords, request])

  function retry() {
    setRequest((previous) => previous + 1)
  }

  return { state, retry }
}

export function useAdminRecordsByUserId<T>(
  loadAll: (signal: AbortSignal) => Promise<T[]>,
  loadByUserId: (userId: number, signal: AbortSignal) => Promise<T[]>,
) {
  const [userId, setUserId] = useState<number | null>(null)
  const loadRecords = useCallback((signal: AbortSignal) => {
    return userId === null ? loadAll(signal) : loadByUserId(userId, signal)
  }, [loadAll, loadByUserId, userId])
  const { state, retry } = useAdminRequest(loadRecords)

  function searchByUserId(nextUserId: number | null) {
    setUserId(nextUserId)
    if (nextUserId === userId) retry()
  }

  return { state: state.status === 'ready' ? { status: 'ready' as const, records: state.data } : state, retry, userId, searchByUserId }
}
