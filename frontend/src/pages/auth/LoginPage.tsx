import PasswordField from '../../components/common/PasswordField'
import AuthPageLayout from '../../components/layout/AuthPageLayout'
import { authTokenStorageKey, getSessionRole, logIn } from '../../services/auth'

async function submitLogin(fields: FormData) {
  const username = String(fields.get('username') ?? '')
  const password = String(fields.get('password') ?? '')
  if (!username.trim()) throw new Error('Enter your username.')

  const token = await logIn({ username, password })
  const role = await getSessionRole(token)
  if (!role) throw new Error('Your session could not be verified. Log in again.')

  try {
    sessionStorage.setItem(authTokenStorageKey, token)
  } catch {
    throw new Error('Your browser could not save the login session. Check your browser settings and try again.')
  }

  if (role === 'ADMIN') {
    window.location.replace('/admin')
    return
  }

  return 'You’re logged in.'
}

function LoginPage() {
  const justRegistered = new URLSearchParams(window.location.search).get('registered') === '1'

  return (
    <AuthPageLayout
      variant="login"
      title="Welcome back !!"
      submitLabel="Log in"
      pendingLabel="Logging in…"
      initialMessage={justRegistered ? 'Account created. Log in with your username and password.' : undefined}
      onSubmit={submitLogin}
      footer={<>New to Project Scale? <a href="/signup">Sign up</a></>}
    >
      <div className="auth-page__field">
        <input id="username" name="username" autoComplete="username" placeholder=" " required />
        <label htmlFor="username">Username</label>
      </div>
      <PasswordField name="password" label="Password" autoComplete="current-password" />
    </AuthPageLayout>
  )
}

export default LoginPage
