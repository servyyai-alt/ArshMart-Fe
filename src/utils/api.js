import axios from 'axios'
import { runtimeConfig } from './runtime.js'

const api = axios.create({
  baseURL: runtimeConfig.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedMessage =
      error.response?.data?.message ||
      error.response?.data?.detail?.message ||
      error.response?.data?.detail ||
      error.message ||
      'Request failed'

    error.message = Array.isArray(normalizedMessage)
      ? normalizedMessage.join(', ')
      : String(normalizedMessage)

    return Promise.reject(error)
  },
)

export default api
