const API_BASE = import.meta.env.VITE_API_BASE_URL

function getToken() {
  return localStorage.getItem('mindcheck_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const text = await response.text()
 
  let data = {}

  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`Expected JSON but received: ${text.slice(0, 80)}`)
  }

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export async function apiFetch(path, options = {}) {
  return request(path, options)
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  getArticles: (query = '') => request(`/articles${query ? `?${query}` : ''}`),
  createCheckin: (payload) => request('/checkins', { method: 'POST', body: JSON.stringify(payload) }),
  getCheckins: () => request('/checkins'),
  getSummary: () => request('/checkins/summary'),
  getSupportOptions: () => request('/resources/support'),
}