import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orders: [],
  farmerOrders: [],
  isLoading: false,
  error: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload
    },
    setFarmerOrders: (state, action) => {
      state.farmerOrders = action.payload
    },
    updateOrderStatus: (state, action) => {
      const order = state.farmerOrders.find(o => o.id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setOrders,
  setFarmerOrders,
  updateOrderStatus,
  setLoading,
  setError,
} = ordersSlice.actions
export default ordersSlice.reducer
