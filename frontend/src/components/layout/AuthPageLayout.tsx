import type { ReactNode } from 'react'
import authIllustration from '../../assets/images/Login and Signup page bottom.png'
import '../../styles/auth-page.css'

type AuthPageLayoutProps = {
  variant: 'signup' | 'login'
  title: string
  submitLabel: string
  footer: ReactNode
  children: ReactNode
}

function AuthPageLayout({ variant, title, submitLabel, footer, children }: AuthPageLayoutProps) {
  return (
    <main className={`auth-page auth-page--${variant}`}>
      <div className="auth-page__content">
        <h1>{title}</h1>
        <form className="auth-page__form" onSubmit={(event) => event.preventDefault()}>
          <div className="auth-page__fields">{children}</div>
          <button className="auth-page__submit" type="submit" disabled>{submitLabel}</button>
        </form>
        <p className="auth-page__switch">{footer}</p>
      </div>
      <div className="auth-page__artwork" aria-hidden="true">
        <img className="auth-page__illustration" src={authIllustration} alt="" width={2172} height={724} />
        <div className="flying-birds auth-page__birds">
          <span className="flying-bird" />
          <span className="flying-bird" />
          <span className="flying-bird" />
          <span className="flying-bird" />
        </div>
      </div>
    </main>
  )
}

export default AuthPageLayout
