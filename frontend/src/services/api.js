import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://f1insight-2.onrender.com/api' : '/api'),
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('f1_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error unwrap
api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || { message: 'Network error' })
)

export default api
