import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchAnimals,
  fetchAnimalById,
  fetchAnimalTypes,
  fetchBreeds,
} from '../../services/animalsService'

export const getAnimals = createAsyncThunk(
  'animals/getAnimals',
  async ({ page, search, filters }, { rejectWithValue }) => {
    try {
      const data = await fetchAnimals({ page, search, filters })
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load animals')
    }
  }
)

export const getAnimalById = createAsyncThunk(
  'animals/getAnimalById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchAnimalById(id)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Animal not found')
    }
  }
)

export const getAnimalTypes = createAsyncThunk(
  'animals/getAnimalTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAnimalTypes()
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load animal types')
    }
  }
)

export const getBreeds = createAsyncThunk(
  'animals/getBreeds',
  async (animalTypeId = null, { rejectWithValue }) => {
    try {
      const data = await fetchBreeds(animalTypeId)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load breeds')
    }
  }
)

const initialState = {
  animals: [],
  selectedAnimal: null,
  animalTypes: [],
  breeds: [],
  filters: {
    breed: '',
    max_price: 300000,
    max_age: '',
    animal_type: '',
    verified_only: false,
  },
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
  isLoading: false,
  error: null,
}

const animalsSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    addLocalAnimal: (state, action) => {
      state.animals.unshift(action.payload)
      state.pagination.totalCount += 1
    },
    updateLocalAnimal: (state, action) => {
      const index = state.animals.findIndex((animal) => animal.id === action.payload.id)
      if (index !== -1) state.animals[index] = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.currentPage = 1
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        breed: '',
        max_price: 300000,
        max_age: '',
        animal_type: '',
        verified_only: false,
      }
      state.searchQuery = ''
      state.pagination.currentPage = 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAnimals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAnimals.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.animals && action.payload.animals.length > 0) {
          state.animals = action.payload.animals
          state.pagination.totalPages = action.payload.total_pages || 1
          state.pagination.totalCount = action.payload.total_count ?? action.payload.animals.length
        }
      })
      .addCase(getAnimals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to load animals.'
      })
      .addCase(getAnimalById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAnimalById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedAnimal = action.payload
      })
      .addCase(getAnimalById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to load animal details'
      })
      .addCase(getAnimalTypes.fulfilled, (state, action) => {
        state.animalTypes = action.payload || []
      })
      .addCase(getAnimalTypes.rejected, (state, action) => {
        state.error = action.payload || 'Failed to load animal types'
      })
      .addCase(getBreeds.fulfilled, (state, action) => {
        state.breeds = action.payload || []
      })
      .addCase(getBreeds.rejected, (state, action) => {
        state.error = action.payload || 'Failed to load breeds'
      })
  },
})

export const { addLocalAnimal, updateLocalAnimal, setFilters, setSearchQuery, setPage, clearFilters } =
  animalsSlice.actions
export default animalsSlice.reducer
