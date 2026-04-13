const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function apiFetch(path, options = {}) {
  const token =
    localStorage.getItem('mindcheck_token') ||
    localStorage.getItem('token')

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : {}

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}