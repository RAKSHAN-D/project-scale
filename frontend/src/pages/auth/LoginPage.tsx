import PasswordField from '../../components/common/PasswordField'
import AuthPageLayout from '../../components/layout/AuthPageLayout'

function LoginPage() {
  return (
    <AuthPageLayout
      variant="login"
      title="Welcome back"
      submitLabel="Log in"
      footer={<>New to Project Scale? <a href="/signup">Sign up</a></>}
    >
      <div className="auth-page__field">
        <input id="email" name="email" type="email" autoComplete="username" placeholder=" " required />
        <label htmlFor="email">Email</label>
      </div>
      <PasswordField name="password" label="Password" autoComplete="current-password" />
    </AuthPageLayout>
  )
}

export default LoginPage
