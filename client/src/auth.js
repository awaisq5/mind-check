export function saveAuth(auth) {
  localStorage.setItem('mindcheck_token', auth.token)
  localStorage.setItem('mindcheck_user', JSON.stringify(auth.user))
}

export function clearAuth() {
  localStorage.removeItem('mindcheck_token')
  localStorage.removeItem('mindcheck_user')
}

export function getStoredUser() {
  const raw = localStorage.getItem('mindcheck_user')
  return raw ? JSON.parse(raw) : null
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('mindcheck_token'))
}
