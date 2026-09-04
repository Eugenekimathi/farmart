import axios from 'axios'

const AUTH_STORAGE_KEY = 'farmart.auth'

const configuredApiUrl = typeof __FARMART_API_URL__ === 'string'
  ? __FARMART_API_URL__.replace(/\/$/, '')
  : ''

const getApiBaseUrl = () => configuredApiUrl || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: getApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  // Read the persisted session instead of importing the Redux store here.
  // Services are imported by slices, so importing the store would form a
  // circular dependency and could initialise a reducer as undefined.
  let token = null
  try {
    token = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY))?.token || null
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
