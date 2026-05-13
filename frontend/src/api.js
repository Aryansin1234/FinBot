import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

export async function loadArticle(url, sessionId = null) {
  const { data } = await api.post('/api/load-article', { url, session_id: sessionId })
  return data
}

export async function sendMessage(sessionId, question) {
  const { data } = await api.post('/api/chat', { session_id: sessionId, question })
  return data
}

export async function clearSession(sessionId) {
  await api.delete(`/api/session/${sessionId}`)
}
