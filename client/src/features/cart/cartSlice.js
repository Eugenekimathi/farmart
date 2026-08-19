import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchCart,
  addToCart,
  removeFromCart,
  clearCartApi,
} from '../../services/cartService'

// Fetch cart from backend (called on app load if user is logged in)
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCart()
      return data
    } catch (error) {
      return rejectWithValue('Failed to load cart.')
    }
  }
)

// Sync add to backend after adding locally
export const syncAddToCart = createAsyncThunk(
  'cart/syncAdd',
  async (animalId, { rejectWithValue }) => {
    try {
      const data = await addToCart(animalId)
      return data
    } catch (error) {
      return rejectWithValue('Failed to add item to cart.')
    }
  }
)

// Remove item from backend and local state
export const deleteCartItem = createAsyncThunk(
  'cart/deleteItem',
  async ({ cartItemId, animalId }, { rejectWithValue }) => {
    try {
      await removeFromCart(cartItemId)
      return animalId
    } catch (error) {
      return rejectWithValue('Failed to remove item.')
    }
  }
)

const initialState = {
  items: [],
  isLoading: false,
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Optimistic local add — before API confirms
    addItem: (state, action) => {
      const exists = state.items.find(
        (item) => item.id === action.payload.id
      )
      if (!exists) {
        state.items.push(action.payload)
      }
    },
    // Optimistic local remove
    removeItem: (state, action) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload
      )
    },
    clearCart: (state) => {
      state.items = []
    },
    clearCartError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns cart_items with nested animal objects
        state.items = action.payload.cart_items?.map(
          (ci) => ({ ...ci.animal, cartItemId: ci.id })
        ) || []
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Delete item
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.id !== action.payload
        )
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { addItem, removeItem, clearCart, clearCartError } =
  cartSlice.actions
export default cartSlice.reducer
