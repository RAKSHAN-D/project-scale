import HomePage from './pages/HomePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDataPage from './pages/admin/AdminDataPage'
import AdminHotDataPage from './pages/admin/AdminHotDataPage'
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
      return <AdminRoute><AdminHotDataPage /></AdminRoute>
    case '/admin/cold-data':
      return <AdminRoute><AdminDataPage /></AdminRoute>
    case '/signup':
      return <SignUpPage />
    case '/login':
      return <LoginPage />
    default:
      return <HomePage />
  }
}

export default App
