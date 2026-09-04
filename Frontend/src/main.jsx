import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { setCredentials } from './features/auth/authSlice'
import App from './App'
import './styles/index.css'
import './index.css'

// Rehydrate auth from localStorage on page load
const savedAuth = localStorage.getItem('farmart.auth')
if (savedAuth) {
  try {
    const { user, token } = JSON.parse(savedAuth)
    if (user && token) {
      store.dispatch(setCredentials({ user, token }))
    }
  } catch {
    localStorage.removeItem('farmart.auth')
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
