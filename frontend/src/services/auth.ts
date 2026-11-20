type LoginCredentials = {
  username: string
  password: string
}

type SignupCredentials = LoginCredentials & {
  email: string
}

type AuthErrorBody = {
  message?: unknown
  fieldErrors?: Record<string, unknown>
}

async function postAuth(path: '/auth/login' | '/auth/signup', credentials: LoginCredentials | SignupCredentials, expectedStatus: number) {
  let response: Response
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new Error('Could not reach the authentication service. Try again.')
  }

  if (response.status === expectedStatus) return response
  if (response.status === 401 && path === '/auth/login') {
    throw new Error('Invalid username or password.')
  }

  if (response.status === 400 || response.status === 409) {
    const error: AuthErrorBody | null = await response.json().catch(() => null)

    if (response.status === 409) {
      if (error?.message === 'Username already exists') throw new Error('That username is already taken.')
      if (error?.message === 'Email already exists') throw new Error('An account already uses that email.')
      throw new Error('Those account details are already in use. Check your username and email.')
    }

    if (error?.fieldErrors && typeof error.fieldErrors === 'object') {
      const fieldError = Object.values(error.fieldErrors).find((value) => typeof value === 'string')
      if (fieldError) throw new Error(fieldError)
    }
    throw new Error('Check the information you entered and try again.')
  }

  throw new Error('The authentication service could not complete the request. Try again.')
}

export async function signUp(credentials: SignupCredentials) {
  await postAuth('/auth/signup', credentials, 201)
}

export async function logIn(credentials: LoginCredentials) {
  const response = await postAuth('/auth/login', credentials, 200)
  const session: { token?: unknown; tokenType?: unknown } | null = await response.json().catch(() => null)

  if (typeof session?.token !== 'string' || !session.token.trim() || session.tokenType !== 'Bearer') {
    throw new Error('The authentication service returned an invalid session. Try again.')
  }

  return session.token
}
