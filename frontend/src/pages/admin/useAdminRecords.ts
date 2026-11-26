import { useCallback, useEffect, useState } from 'react'

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; records: T[] }
  | { status: 'error'; message: string }

function useAdminRecords<T>(loadRecords: (signal: AbortSignal) => Promise<T[]>) {
  const [request, setRequest] = useState(0)
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const records = await loadRecords(controller.signal)
        if (!controller.signal.aborted) setState({ status: 'ready', records })
      } catch (error) {
        if (controller.signal.aborted) return
        const message = error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : 'Could not reach the backend.'
        setState({ status: 'error', message })
      }
    }

    void load()
    return () => controller.abort()
  }, [loadRecords, request])

  function retry() {
    setState({ status: 'loading' })
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
  const { state, retry } = useAdminRecords(loadRecords)

  function searchByUserId(nextUserId: number | null) {
    setUserId(nextUserId)
    retry()
  }

  return { state, retry, userId, searchByUserId }
}
