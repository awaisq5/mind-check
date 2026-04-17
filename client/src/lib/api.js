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

  let data = {}

  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`Expected JSON but received: ${text.slice(0, 120)}`)
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}