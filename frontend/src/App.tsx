import HomePage from './pages/HomePage'
import SignUpPage from './pages/auth/SignUpPage'

function App() {
  if (window.location.pathname === '/signup' || window.location.pathname === '/signup/') {
    return <SignUpPage />
  }

  return <HomePage />
}

export default App
