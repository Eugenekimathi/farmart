import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import animalsReducer from '../features/animals/animalsSlice'
import cartReducer from '../features/cart/cartSlice'
import ordersReducer from '../features/orders/ordersSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    animals: animalsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
})

let previousAuthToken = store.getState().auth.token

store.subscribe(() => {
  const { user, token, role } = store.getState().auth
  if (token === previousAuthToken) return
  previousAuthToken = token
  if (user && token) {
    localStorage.setItem('farmart.auth', JSON.stringify({ user, token, role }))
  } else {
    localStorage.removeItem('farmart.auth')
  }
})

export default store
