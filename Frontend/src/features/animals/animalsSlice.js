import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  fetchAnimals,
  fetchAnimalById,
  fetchAnimalTypes,
  fetchBreeds,
} from '../../services/animalsService'
import dorperRamImage from '../../assets/Images/istockphoto-994736082-612x612.jpg'
import sahiwalHeiferImage from '../../assets/Images/pure-sahiwal-cow-649.jpg'

export const INITIAL_MOCK_ANIMALS = [
  {
    id: '1',
    name: 'Purebred Boran Bull',
    breed: { id: 'b1', name: 'Boran' },
    animal_type: { id: 't1', name: 'Cattle' },
    location: 'Naivasha',
    weight: '450 kg',
    age: 36,
    price: 95000,
    savings: 35000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: false,
    images: [{ image_url: '/placeholder.svg', is_primary: true }],
    description: 'Purebred Boran bull raised in Naivasha. High resistance to drought and tropical diseases. KVB vet certified with full immunization records.',
  },
  {
    id: '2',
    name: 'Sahiwal Heifer',
    breed: { id: 'b2', name: 'Sahiwal' },
    animal_type: { id: 't1', name: 'Cattle' },
    location: 'Laikipia',
    weight: '400 kg',
    age: 24,
    price: 72000,
    savings: 25000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: true,
    images: [{ image_url: sahiwalHeiferImage, is_primary: true }],
    description: 'High-yielding Sahiwal heifer from Laikipia pasture. Great dual-purpose milk and beef cattle.',
  },
  {
    id: '3',
    name: 'Dorper Ram',
    breed: { id: 'b3', name: 'Dorper' },
    animal_type: { id: 't2', name: 'Sheep' },
    location: 'Nakuru',
    weight: '85 kg',
    age: 18,
    price: 18000,
    savings: 6000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: false,
    images: [{ image_url: dorperRamImage, is_primary: true }],
    description: 'Blackhead Dorper ram from Nakuru. Fast growing, high meat yield stud stock.',
  },
  {
    id: '4',
    name: 'Piglet',
    breed: { id: 'b4', name: 'Red Maasai' },
    animal_type: { id: 't2', name: 'Sheep' },
    location: 'Kajiado',
    weight: '50 kg',
    age: 14,
    price: 12500,
    savings: 4500,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: true,
    images: [{ image_url: '/placeholder.svg', is_primary: true }],
    description: 'Resilient indigenous Red Maasai ewe raised in Kajiado. High parasite tolerance.',
  },
  {
    id: '5',
    name: 'Galla Goat',
    breed: { id: 'b5', name: 'Galla' },
    animal_type: { id: 't3', name: 'Goat' },
    location: 'Isiolo',
    weight: '45 kg',
    age: 12,
    price: 8500,
    savings: 3000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: true,
    images: [{ image_url: '/placeholder.svg', is_primary: true }],
    description: 'White Galla goat (Milk Queen) from Isiolo. Excellent milk producer in dry rangelands.',
  },
  {
    id: '6',
    name: 'Dairy Friesian Cow',
    breed: { id: 'b6', name: 'Friesian' },
    animal_type: { id: 't1', name: 'Cattle' },
    location: 'Nyandarua',
    weight: '550 kg',
    age: 30,
    price: 140000,
    savings: 45000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: false,
    images: [{ image_url: '/placeholder.svg', is_primary: true }],
    description: 'Pure Friesian cow in Nyandarua producing over 30 liters daily. Healthy and vaccinated.',
  },
]

export const getAnimals = createAsyncThunk(
  'animals/getAnimals',
  async ({ page, search, filters }, { rejectWithValue }) => {
    try {
      const data = await fetchAnimals({ page, search, filters })
      return data
    } catch {
      // Fallback to local filter calculation if backend offline
      let result = [...INITIAL_MOCK_ANIMALS]
      if (search) {
        const q = search.toLowerCase()
        result = result.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.location.toLowerCase().includes(q) ||
            a.breed.name.toLowerCase().includes(q)
        )
      }
      if (filters.max_price && filters.max_price < 300000) {
        result = result.filter((a) => a.price <= Number(filters.max_price))
      }
      if (filters.breed) {
        result = result.filter(
          (a) =>
            a.breed.name.toLowerCase() === filters.breed.toLowerCase() ||
            a.breed.id === filters.breed
        )
      }
      if (filters.kvb_certified) {
        result = result.filter((a) => a.kvb_certified)
      }
      if (filters.pasture_raised) {
        result = result.filter((a) => a.pasture_raised)
      }
      if (filters.direct_delivery) {
        result = result.filter((a) => a.direct_delivery)
      }

      return {
        animals: result,
        total_pages: 1,
        total_count: result.length,
      }
    }
  }
)

export const getAnimalById = createAsyncThunk(
  'animals/getAnimalById',
  async (id, { rejectWithValue }) => {
    try {
      const data = await fetchAnimalById(id)
      return data
    } catch {
      const animal = INITIAL_MOCK_ANIMALS.find((a) => a.id === String(id))
      if (animal) return animal
      return rejectWithValue('Animal not found.')
    }
  }
)

export const getAnimalTypes = createAsyncThunk(
  'animals/getAnimalTypes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAnimalTypes()
      return data
    } catch {
      return [
        { id: 't1', name: 'Cattle' },
        { id: 't2', name: 'Sheep' },
        { id: 't3', name: 'Goat' },
      ]
    }
  }
)

export const getBreeds = createAsyncThunk(
  'animals/getBreeds',
  async (animalTypeId = null, { rejectWithValue }) => {
    try {
      const data = await fetchBreeds(animalTypeId)
      return data
    } catch {
      return [
        { id: 'b1', name: 'Boran' },
        { id: 'b2', name: 'Sahiwal' },
        { id: 'b3', name: 'Dorper' },
        { id: 'b4', name: 'Red Maasai' },
        { id: 'b5', name: 'Galla' },
        { id: 'b6', name: 'Friesian' },
      ]
    }
  }
)

const initialState = {
  animals: INITIAL_MOCK_ANIMALS,
  selectedAnimal: null,
  animalTypes: [
    { id: 't1', name: 'Cattle' },
    { id: 't2', name: 'Sheep' },
    { id: 't3', name: 'Goat' },
  ],
  breeds: [
    { id: 'b1', name: 'Boran' },
    { id: 'b2', name: 'Sahiwal' },
    { id: 'b3', name: 'Dorper' },
    { id: 'b4', name: 'Red Maasai' },
    { id: 'b5', name: 'Galla' },
    { id: 'b6', name: 'Friesian' },
  ],
  filters: {
    breed: '',
    max_price: 300000,
    kvb_certified: true,
    pasture_raised: true,
    direct_delivery: false,
    age: '',
    animal_type: '',
  },
  searchQuery: '',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 6,
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
      state.animals = filterMockListings(INITIAL_MOCK_ANIMALS, state.searchQuery, state.filters)
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      state.pagination.currentPage = 1
      state.animals = filterMockListings(INITIAL_MOCK_ANIMALS, state.searchQuery, state.filters)
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload
    },
    clearFilters: (state) => {
      state.filters = {
        breed: '',
        max_price: 300000,
        kvb_certified: false,
        pasture_raised: false,
        direct_delivery: false,
        age: '',
        animal_type: '',
      }
      state.searchQuery = ''
      state.pagination.currentPage = 1
      state.animals = INITIAL_MOCK_ANIMALS
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
      .addCase(getAnimalById.fulfilled, (state, action) => {
        state.isLoading = false
        state.selectedAnimal = action.payload
      })
  },
})

function filterMockListings(list, searchQuery, filters) {
  let result = [...list]
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.breed.name.toLowerCase().includes(q)
    )
  }
  if (filters.max_price && filters.max_price < 300000) {
    result = result.filter((a) => a.price <= Number(filters.max_price))
  }
  if (filters.breed) {
    result = result.filter(
      (a) =>
        a.breed.name.toLowerCase() === filters.breed.toLowerCase() ||
        a.breed.id === filters.breed
    )
  }
  if (filters.kvb_certified) {
    result = result.filter((a) => a.kvb_certified)
  }
  if (filters.pasture_raised) {
    result = result.filter((a) => a.pasture_raised)
  }
  if (filters.direct_delivery) {
    result = result.filter((a) => a.direct_delivery)
  }
  return result
}

export const { addLocalAnimal, updateLocalAnimal, setFilters, setSearchQuery, setPage, clearFilters } =
  animalsSlice.actions
export default animalsSlice.reducer
