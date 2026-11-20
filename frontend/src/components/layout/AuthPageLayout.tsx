import { useState, type FormEvent, type ReactNode } from 'react'
import authIllustration from '../../assets/images/Login and Signup page bottom.png'
import '../../styles/auth-page.css'

type AuthPageLayoutProps = {
  variant: 'signup' | 'login'
  title: string
  submitLabel: string
  pendingLabel: string
  initialMessage?: string
  onSubmit: (fields: FormData) => Promise<string | void>
  footer: ReactNode
  children: ReactNode
}

function AuthPageLayout({ variant, title, submitLabel, pendingLabel, initialMessage, onSubmit, footer, children }: AuthPageLayoutProps) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(initialMessage ?? '')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const fields = new FormData(form)
    setPending(true)
    setError('')
    setMessage('')

    try {
      const result = await onSubmit(fields)
      form.reset()
      setMessage(result ?? '')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className={`auth-page auth-page--${variant}`}>
      <div className="auth-page__content">
        <h1>{title}</h1>
        <form className="auth-page__form" method="post" onSubmit={handleSubmit}>
          <fieldset className="auth-page__fields" disabled={pending}>{children}</fieldset>
          <button className="auth-page__submit" type="submit" disabled={pending}>
            {pending ? pendingLabel : submitLabel}
          </button>
          {error && <p className="auth-page__feedback auth-page__feedback--error" role="alert">{error}</p>}
          {message && <p className="auth-page__feedback" role="status">{message}</p>}
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
