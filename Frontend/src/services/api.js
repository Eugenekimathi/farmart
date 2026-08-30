import axios from 'axios'
import { store } from '../app/store'

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test') {
    return 'http://localhost:5000/api'
  }
  try {
    return (0, eval)('import.meta.env.VITE_API_URL') || 'http://localhost:5000/api'
  } catch {
    return 'http://localhost:5000/api'
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
