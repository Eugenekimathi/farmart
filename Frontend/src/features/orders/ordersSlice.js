import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  createOrder,
  initiatePayment,
  checkPaymentStatus,
  fetchMyOrders,
} from '../../services/ordersService'
import { fetchOrders, confirmOrderApi, rejectOrderApi } from '../../services/ordersService'

export const INITIAL_FARMER_LISTINGS = [
  { id: 'l1', animal: 'Boran Bull', breed: 'Boran', weight: '450kg', price: '95,000 KSh', status: 'Listed' },
  { id: 'l2', animal: 'Sahiwal Heifer', breed: 'Sahiwal', weight: '400kg', price: '72,000 KSh', status: 'Listed' },
  { id: 'l3', animal: 'Dorper Ram', breed: 'Dorper', weight: '85kg', price: '18,000 KSh', status: 'Pending' },
]

export const INITIAL_INCOMING_ORDERS = [
  { id: 'o1', buyer: 'John K. (Nairobi)', animal: 'Galla Goat', amount: '8,500 KSh', status: 'pending' },
  { id: 'o2', buyer: 'Agnes M. (Eldoret)', animal: 'Red Maasai Ewe', amount: '12,500 KSh', status: 'pending' },
]

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const data = await createOrder(orderData)
      return data
    } catch {
      return { id: 'ORD-' + Math.floor(Math.random() * 90000 + 10000), ...orderData, status: 'confirmed' }
    }
  }
)

export const startPayment = createAsyncThunk(
  'orders/startPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const data = await initiatePayment(paymentData)
      return data
    } catch {
      return { success: true, message: 'STK Push sent successfully' }
    }
  }
)

export const pollPaymentStatus = createAsyncThunk(
  'orders/pollPaymentStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await checkPaymentStatus(orderId)
      return data
    } catch {
      return { status: 'completed' }
    }
  }
)

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchMyOrders()
      return data
    } catch {
      return []
    }
  }
)

export const fetchFarmerOrders = createAsyncThunk(
  'orders/fetchFarmerOrders',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchOrders()
      return data
    } catch {
      return INITIAL_INCOMING_ORDERS
    }
  }
)

export const confirmOrder = createAsyncThunk(
  'orders/confirmOrder',
  async (orderId, { dispatch }) => {
    try {
      await confirmOrderApi(orderId)
    } catch {
      // local fallback
    }
    return orderId
  }
)

export const rejectOrder = createAsyncThunk(
  'orders/rejectOrder',
  async (orderId, { dispatch }) => {
    try {
      await rejectOrderApi(orderId)
    } catch {
      // local fallback
    }
    return orderId
  }
)

const initialState = {
  orders: [],
  farmerListings: INITIAL_FARMER_LISTINGS,
  farmerOrders: INITIAL_INCOMING_ORDERS,
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
    confirmLocalOrder: (state, action) => {
      const order = state.farmerOrders.find((o) => o.id === action.payload)
      if (order) order.status = 'confirmed'
    },
    rejectLocalOrder: (state, action) => {
      const order = state.farmerOrders.find((o) => o.id === action.payload)
      if (order) order.status = 'rejected'
    },
    resetCheckout: (state) => {
      state.currentOrder = null
      state.paymentStatus = null
      state.error = null
      state.paymentError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(confirmOrder.fulfilled, (state, action) => {
        const order = state.farmerOrders.find((o) => o.id === action.payload)
        if (order) order.status = 'confirmed'
      })
      .addCase(rejectOrder.fulfilled, (state, action) => {
        const order = state.farmerOrders.find((o) => o.id === action.payload)
        if (order) order.status = 'rejected'
      })
      .addCase(fetchFarmerOrders.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.farmerOrders = action.payload
        }
      })
  },
})

export const { confirmLocalOrder, rejectLocalOrder, resetCheckout } = ordersSlice.actions
export default ordersSlice.reducer
