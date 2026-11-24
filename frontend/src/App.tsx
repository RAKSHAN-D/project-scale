import HomePage from './pages/HomePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDataPage from './pages/admin/AdminDataPage'
import AdminRoute from './pages/admin/AdminRoute'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'

function App() {
  switch (window.location.pathname.replace(/\/$/, '')) {
    case '/admin':
      return (
        <AdminRoute>
          {new URLSearchParams(window.location.search).get('view') === 'users' ? <AdminUsersPage /> : <AdminDashboardPage />}
        </AdminRoute>
      )
    case '/admin/hot-data':
      return <AdminRoute><AdminDataPage kind="hot" /></AdminRoute>
    case '/admin/cold-data':
      return <AdminRoute><AdminDataPage kind="cold" /></AdminRoute>
    case '/signup':
      return <SignUpPage />
    case '/login':
      return <LoginPage />
    default:
      return <HomePage />
  }
}

export default App
