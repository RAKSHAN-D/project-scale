import { useState } from 'react'

type PasswordFieldProps = {
  name: string
  label: string
  autoComplete: 'new-password' | 'current-password'
}

function PasswordField({ name, label, autoComplete }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-page__field auth-page__field--password">
      <input
        id={name}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder=" "
        required
      />
      <label htmlFor={name}>{label}</label>
      <button
        className="auth-page__visibility"
        type="button"
        aria-label={`Show ${label.toLowerCase()}`}
        aria-pressed={visible}
        onClick={() => setVisible((wasVisible) => !wasVisible)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  )
}

export default PasswordField
