import { useState } from 'react'
import authIllustration from '../../assets/images/Login and Signup page bottom.png'
import '../../styles/sign-up-page.css'

function PasswordField({ name, label }: { name: string; label: string }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="sign-up-page__field sign-up-page__field--password">
      <input id={name} name={name} type={visible ? 'text' : 'password'} autoComplete="new-password" placeholder=" " required />
      <label htmlFor={name}>{label}</label>
      <button
        className="sign-up-page__visibility"
        type="button"
        aria-label={`Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  )
}

function SignUpPage() {
  return (
    <main className="sign-up-page">
      <div className="sign-up-page__content">
        <h1>Create your account</h1>
        <form className="sign-up-page__form" onSubmit={(event) => event.preventDefault()}>
          <div className="sign-up-page__fields">
            <div className="sign-up-page__field">
              <input id="username" name="username" autoComplete="username" placeholder=" " required />
              <label htmlFor="username">Username</label>
            </div>
            <div className="sign-up-page__field">
              <input id="email" name="email" type="email" autoComplete="email" placeholder=" " required />
              <label htmlFor="email">Email</label>
            </div>
            <PasswordField name="password" label="Password" />
            <PasswordField name="confirm-password" label="Confirm Password" />
          </div>
          <button className="sign-up-page__submit" type="submit" disabled>Sign up</button>
        </form>
        <p className="sign-up-page__login">
          Already have an account? <button type="button" disabled>Log in</button>
        </p>
      </div>
      <div className="sign-up-page__artwork" aria-hidden="true">
        <img className="sign-up-page__illustration" src={authIllustration} alt="" width={2172} height={724} />
        <div className="flying-birds sign-up-page__birds">
          <span className="flying-bird" />
          <span className="flying-bird" />
          <span className="flying-bird" />
          <span className="flying-bird" />
        </div>
      </div>
    </main>
  )
}

export default SignUpPage
