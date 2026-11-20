import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'

function App() {
  switch (window.location.pathname.replace(/\/$/, '')) {
    case '/signup':
      return <SignUpPage />
    case '/login':
      return <LoginPage />
    default:
      return <HomePage />
  }
}

export default App
