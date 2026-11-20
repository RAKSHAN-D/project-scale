import PasswordField from '../../components/common/PasswordField'
import AuthPageLayout from '../../components/layout/AuthPageLayout'

function SignUpPage() {
  return (
    <AuthPageLayout
      variant="signup"
      title="Create your account"
      submitLabel="Sign up"
      footer={<>Already have an account? <a href="/login">Log in</a></>}
    >
      <div className="auth-page__field">
        <input id="username" name="username" autoComplete="username" placeholder=" " required />
        <label htmlFor="username">Username</label>
      </div>
      <div className="auth-page__field">
        <input id="email" name="email" type="email" autoComplete="email" placeholder=" " required />
        <label htmlFor="email">Email</label>
      </div>
      <PasswordField name="password" label="Password" autoComplete="new-password" />
      <PasswordField name="confirm-password" label="Confirm Password" autoComplete="new-password" />
    </AuthPageLayout>
  )
}

export default SignUpPage
