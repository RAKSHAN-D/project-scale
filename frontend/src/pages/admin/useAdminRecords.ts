import { useEffect, useState } from 'react'

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; records: T[] }
  | { status: 'error'; message: string }

export function useAdminRecords<T>(loadRecords: ((signal: AbortSignal) => Promise<T[]>) | null) {
  const [request, setRequest] = useState(0)
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' })

  useEffect(() => {
    if (!loadRecords) return

    const controller = new AbortController()
    const fetchRecords = loadRecords

    async function load() {
      try {
        const records = await fetchRecords(controller.signal)
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
