const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
const TOKEN_KEY = 'mindcheck_token'

function read(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getToken() {
  return read(TOKEN_KEY)
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked (private mode): the session lasts until the tab closes.
  }
}

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

/** Calls the API with the session token; throws ApiError with the server's message. */
export async function api(path, { method = 'GET', body, raw = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError('Cannot reach Mind Check. Check your connection; the server may also be waking up, so try again in a moment.', 0)
  }

  if (response.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('mindcheck:logout'))
  }
  if (raw && response.ok) return response
  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }
  if (!response.ok) throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data)
  return data
}
