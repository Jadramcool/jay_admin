type LoginNavigator = () => void | Promise<unknown>

let loginNavigator: LoginNavigator | undefined

export function registerLoginNavigator(navigator: LoginNavigator): void {
  loginNavigator = navigator
}

export async function navigateToLogin(): Promise<void> {
  if (loginNavigator) {
    await loginNavigator()
    return
  }

  const base = import.meta.env.VITE_BASE || '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  window.location.href = import.meta.env.VITE_USE_HASH === 'true'
    ? `${normalizedBase}#/login`
    : `${normalizedBase}login`
}
