import HomePage from './pages/HomePage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'

function App() {
  switch (window.location.pathname.replace(/\/$/, '')) {
    case '/admin':
      return <AdminDashboardPage />
    case '/signup':
      return <SignUpPage />
    case '/login':
      return <LoginPage />
    default:
      return <HomePage />
  }
}

export default App
