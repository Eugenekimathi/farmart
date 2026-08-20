import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchFarmerAnimals,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from '../../services/farmerService'

export const getFarmerAnimals = createAsyncThunk(
  'farmer/getAnimals',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchFarmerAnimals()
    } catch (error) {
      return rejectWithValue('Failed to load your listings.')
    }
  }
)

export const addFarmerAnimal = createAsyncThunk(
  'farmer/addAnimal',
  async (formData, { rejectWithValue }) => {
    try {
      return await createAnimal(formData)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add animal.'
      )
    }
  }
)

export const editFarmerAnimal = createAsyncThunk(
  'farmer/editAnimal',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await updateAnimal(id, formData)
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update animal.'
      )
    }
  }
)

export const removeFarmerAnimal = createAsyncThunk(
  'farmer/removeAnimal',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAnimal(id)
      return id
    } catch (error) {
      return rejectWithValue('Failed to delete listing.')
    }
  }
)

const initialState = {
  listings: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
  submitError: null,
}

const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    clearFarmerError: (state) => {
      state.error = null
      state.submitError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get farmer's animals
      .addCase(getFarmerAnimals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getFarmerAnimals.fulfilled, (state, action) => {
        state.isLoading = false
        state.listings = action.payload
      })
      .addCase(getFarmerAnimals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Add animal
      .addCase(addFarmerAnimal.pending, (state) => {
        state.isSubmitting = true
        state.submitError = null
      })
      .addCase(addFarmerAnimal.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Add new listing to top of list
        state.listings.unshift(action.payload)
      })
      .addCase(addFarmerAnimal.rejected, (state, action) => {
        state.isSubmitting = false
        state.submitError = action.payload
      })

      // Edit animal
      .addCase(editFarmerAnimal.pending, (state) => {
        state.isSubmitting = true
        state.submitError = null
      })
      .addCase(editFarmerAnimal.fulfilled, (state, action) => {
        state.isSubmitting = false
        // Replace updated animal in listings
        const index = state.listings.findIndex(
          (a) => a.id === action.payload.id
        )
        if (index !== -1) state.listings[index] = action.payload
      })
      .addCase(editFarmerAnimal.rejected, (state, action) => {
        state.isSubmitting = false
        state.submitError = action.payload
      })

      // Delete animal
      .addCase(removeFarmerAnimal.fulfilled, (state, action) => {
        state.listings = state.listings.filter(
          (a) => a.id !== action.payload
        )
      })
      .addCase(removeFarmerAnimal.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearFarmerError } = farmerSlice.actions
export default farmerSlice.reducer
