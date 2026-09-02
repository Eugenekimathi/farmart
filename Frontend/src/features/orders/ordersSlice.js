import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createOrder,
  initiatePayment,
  checkPaymentStatus,
  fetchMyOrders,
} from '../../services/ordersService'
import {
  fetchFarmerOrders,
  confirmOrder,
  rejectOrder,
} from '../../services/farmerService'

// ── Buyer thunks ─────────────────────────────────────────────

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await createOrder(orderData)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to place order.'
      )
    }
  }
)

export const startPayment = createAsyncThunk(
  'orders/startPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await initiatePayment(paymentData)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Payment initiation failed.'
      )
    }
  }
)

export const pollPaymentStatus = createAsyncThunk(
  'orders/pollPaymentStatus',
  async (checkoutRequestId, { rejectWithValue }) => {
    try {
      return await checkPaymentStatus(checkoutRequestId)
    } catch (error) {
      return rejectWithValue('Could not check payment status.')
    }
  }
)

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      return await fetchMyOrders(getState().auth.user?.id)
    } catch (error) {
      return rejectWithValue('Failed to load orders.')
    }
  }
)

// ── Farmer thunks ─────────────────────────────────────────────

export const getFarmerOrders = createAsyncThunk(
  'orders/getFarmerOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      return await fetchFarmerOrders()
    } catch (error) {
      return rejectWithValue('Failed to load farmer orders.')
    }
  }
)

export const confirmFarmerOrder = createAsyncThunk(
  'orders/confirmOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await confirmOrder(orderId)
      return { orderId, ...data }
    } catch (error) {
      return rejectWithValue('Failed to confirm order.')
    }
  }
)

export const rejectFarmerOrder = createAsyncThunk(
  'orders/rejectOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await rejectOrder(orderId)
      return { orderId, ...data }
    } catch (error) {
      return rejectWithValue('Failed to reject order.')
    }
  }
)

// ── Slice ──────────────────────────────────────────────────────

const initialState = {
  orders: [],
  farmerOrders: [],
  currentOrder: null,
  paymentStatus: null,
  checkoutRequestId: null,
  isLoading: false,
  isFarmerOrdersLoading: false,
  isPaymentLoading: false,
  error: null,
  paymentError: null,
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.currentOrder = null
      state.paymentStatus = null
      state.checkoutRequestId = null
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
      .addCase(startPayment.fulfilled, (state, action) => {
        state.isPaymentLoading = false
        state.paymentStatus = 'PENDING'
        state.checkoutRequestId = action.payload?.checkout_request_id || null
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

      // My orders (buyer)
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = Array.isArray(action.payload) ? action.payload : action.payload.orders || []
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Farmer orders
      .addCase(getFarmerOrders.pending, (state) => {
        state.isFarmerOrdersLoading = true
      })
      .addCase(getFarmerOrders.fulfilled, (state, action) => {
        state.isFarmerOrdersLoading = false
        state.farmerOrders = action.payload
      })
      .addCase(getFarmerOrders.rejected, (state, action) => {
        state.isFarmerOrdersLoading = false
        state.error = action.payload
      })

      // Confirm order — update status locally immediately
      .addCase(confirmFarmerOrder.fulfilled, (state, action) => {
        const order = state.farmerOrders.find(
          (o) => o.id === action.payload.orderId
        )
        if (order) order.status = 'confirmed'
      })

      // Reject order — update status locally immediately
      .addCase(rejectFarmerOrder.fulfilled, (state, action) => {
        const order = state.farmerOrders.find(
          (o) => o.id === action.payload.orderId
        )
        if (order) order.status = 'rejected'
      })
  },
})

export const { resetCheckout, clearOrderError } = ordersSlice.actions
export default ordersSlice.reducer
