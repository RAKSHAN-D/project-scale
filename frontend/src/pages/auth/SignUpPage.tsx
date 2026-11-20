import PasswordField from '../../components/common/PasswordField'
import AuthPageLayout from '../../components/layout/AuthPageLayout'
import { signUp } from '../../services/auth'

async function submitSignup(fields: FormData) {
  const username = String(fields.get('username') ?? '').trim()
  const email = String(fields.get('email') ?? '').trim()
  const password = String(fields.get('password') ?? '')
  const confirmation = fields.get('confirm-password')

  if (!username) throw new Error('Enter a username.')
  if (password !== confirmation) throw new Error('Passwords do not match.')
  if (new TextEncoder().encode(password).length > 72) {
    throw new Error('That password is too long. Use fewer characters and try again.')
  }

  await signUp({ username, email, password })
  window.location.replace('/login?registered=1')
}

function SignUpPage() {
  return (
    <AuthPageLayout
      variant="signup"
      title="Create your account"
      submitLabel="Sign up"
      pendingLabel="Creating account…"
      onSubmit={submitSignup}
      footer={<>Already have an account? <a href="/login">Log in</a></>}
    >
      <div className="auth-page__field">
        <input id="username" name="username" autoComplete="username" maxLength={50} placeholder=" " required />
        <label htmlFor="username">Username</label>
      </div>
      <div className="auth-page__field">
        <input id="email" name="email" type="email" autoComplete="email" maxLength={255} placeholder=" " required />
        <label htmlFor="email">Email</label>
      </div>
      <PasswordField name="password" label="Password" autoComplete="new-password" />
      <PasswordField name="confirm-password" label="Confirm Password" autoComplete="new-password" />
    </AuthPageLayout>
  )
}

export default SignUpPage
