import { useEffect, useState, type ReactNode } from 'react'
import { authTokenStorageKey, getSessionRole } from '../../services/auth'

function AdminRoute({ children }: { children: ReactNode }) {
  const [access, setAccess] = useState<'checking' | 'granted' | 'unavailable'>('checking')

  useEffect(() => {
    const controller = new AbortController()

    async function checkAccess() {
      try {
        const token = sessionStorage.getItem(authTokenStorageKey)
        if (!token) {
          window.location.replace('/login')
          return
        }

        const role = await getSessionRole(token, controller.signal)
        if (controller.signal.aborted) return

        if (!role) {
          sessionStorage.removeItem(authTokenStorageKey)
          window.location.replace('/login')
        } else if (role === 'ADMIN') {
          setAccess('granted')
        } else {
          window.location.replace('/')
        }
      } catch {
        if (!controller.signal.aborted) setAccess('unavailable')
      }
    }

    void checkAccess()
    return () => controller.abort()
  }, [])

  if (access === 'granted') return children

  return (
    <main>
      {access === 'checking' ? (
        <p role="status">Checking admin access…</p>
      ) : (
        <p role="alert">Could not verify admin access. <a href={window.location.href}>Try again</a> or <a href="/login">log in</a>.</p>
      )}
    </main>
  )
}

export default AdminRoute
