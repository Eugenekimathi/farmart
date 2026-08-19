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

export default store
