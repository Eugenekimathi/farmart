import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createOrder,
  initiatePayment,
  checkPaymentStatus,
  fetchMyOrders,
} from '../../services/ordersService'

// Create order from cart items
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const data = await createOrder(orderData)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to place order.'
      )
    }
  }
)

// Initiate M-Pesa STK push
export const startPayment = createAsyncThunk(
  'orders/startPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await initiatePayment(paymentData)
      return data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Payment initiation failed.'
      )
    }
  }
)

// Poll payment status after STK push
export const pollPaymentStatus = createAsyncThunk(
  'orders/pollPaymentStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await checkPaymentStatus(orderId)
      return data
    } catch (error) {
      return rejectWithValue('Could not check payment status.')
    }
  }
)

// Fetch buyer's order history
export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchMyOrders()
      return data
    } catch (error) {
      return rejectWithValue('Failed to load orders.')
    }
  }
)

const initialState = {
  orders: [],
  farmerOrders: [],
  currentOrder: null,
  paymentStatus: null,
  isLoading: false,
  isPaymentLoading: false,
  error: null,
  paymentError: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setFarmerOrders: (state, action) => {
      state.farmerOrders = action.payload
    },
    updateOrderStatus: (state, action) => {
      const order = state.farmerOrders.find(
        (o) => o.id === action.payload.orderId
      )
      if (order) order.status = action.payload.status
    },
    resetCheckout: (state) => {
      state.currentOrder = null
      state.paymentStatus = null
      state.error = null
      state.paymentError = null
    },
    clearOrderError: (state) => {
      state.error = null
      state.paymentError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Start payment
      .addCase(startPayment.pending, (state) => {
        state.isPaymentLoading = true
        state.paymentError = null
        state.paymentStatus = 'pending'
      })
      .addCase(startPayment.fulfilled, (state) => {
        state.isPaymentLoading = false
        // STK push sent — still waiting for user to confirm on phone
        state.paymentStatus = 'stk_sent'
      })
      .addCase(startPayment.rejected, (state, action) => {
        state.isPaymentLoading = false
        state.paymentError = action.payload
        state.paymentStatus = 'failed'
      })

      // Poll payment status
      .addCase(pollPaymentStatus.fulfilled, (state, action) => {
        state.paymentStatus = action.payload.status
      })

      // My orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const {
  setFarmerOrders,
  updateOrderStatus,
  resetCheckout,
  clearOrderError,
} = ordersSlice.actions
export default ordersSlice.reducer
