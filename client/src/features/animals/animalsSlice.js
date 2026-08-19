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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load animals.'
      )
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
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load animal.'
      )
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
      return rejectWithValue('Failed to load animal types.')
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
      return rejectWithValue('Failed to load breeds.')
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
    age: '',
    animal_type: '',
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
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      // reset to page 1 whenever filters change
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
      state.filters = { breed: '', age: '', animal_type: '' }
      state.searchQuery = ''
      state.pagination.currentPage = 1
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all animals
      .addCase(getAnimals.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getAnimals.fulfilled, (state, action) => {
        state.isLoading = false
        state.animals = action.payload.animals
        state.pagination.totalPages = action.payload.total_pages
        state.pagination.totalCount = action.payload.total_count
      })
      .addCase(getAnimals.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get single animal
      .addCase(getAnimalById.pending, (state) => {
        state.isLoading = true
        state.selectedAnimal = null
      })
      .addCase(getAnimalById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedAnimal = action.payload
      })
      .addCase(getAnimalById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Animal types
      .addCase(getAnimalTypes.fulfilled, (state, action) => {
        state.animalTypes = action.payload
      })

      // Breeds
      .addCase(getBreeds.fulfilled, (state, action) => {
        state.breeds = action.payload
      })
  },
})

export const { setFilters, setSearchQuery, setPage, clearFilters } =
  animalsSlice.actions
export default animalsSlice.reducer
