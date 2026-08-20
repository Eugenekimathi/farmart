import animalsReducer, {
  setFilters,
  setSearchQuery,
  setPage,
  clearFilters,
} from '../features/animals/animalsSlice'

const mockAnimals = [
  { id: 1, name: 'Boran Bull', price: '95000', status: 'available' },
  { id: 2, name: 'Sahiwal Heifer', price: '72000', status: 'available' },
]

describe('animalsSlice', () => {

  const initialState = {
    animals: [],
    selectedAnimal: null,
    animalTypes: [],
    breeds: [],
    filters: { breed: '', age: '', animal_type: '' },
    searchQuery: '',
    pagination: { currentPage: 1, totalPages: 1, totalCount: 0 },
    isLoading: false,
    error: null,
  }

  it('should return the initial state', () => {
    const state = animalsReducer(undefined, { type: 'unknown' })
    expect(state.selectedAnimal).toBeNull()
    expect(state.searchQuery).toBe('')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('should update search query', () => {
    const state = animalsReducer(initialState, setSearchQuery('bull'))

    expect(state.searchQuery).toBe('bull')
  })

  it('should reset page to 1 when search query changes', () => {
    const withPage = {
      ...initialState,
      pagination: { ...initialState.pagination, currentPage: 3 },
    }
    const state = animalsReducer(withPage, setSearchQuery('goat'))

    expect(state.pagination.currentPage).toBe(1)
  })

  it('should update a single filter without overwriting others', () => {
    const state = animalsReducer(
      initialState,
      setFilters({ breed: '2' })
    )

    expect(state.filters.breed).toBe('2')
    expect(state.filters.age).toBe('')
    expect(state.filters.animal_type).toBe('')
  })

  it('should update multiple filters at once', () => {
    const state = animalsReducer(
      initialState,
      setFilters({ breed: '2', age: '24' })
    )

    expect(state.filters.breed).toBe('2')
    expect(state.filters.age).toBe('24')
  })

  it('should reset page to 1 when filters change', () => {
    const withPage = {
      ...initialState,
      pagination: { ...initialState.pagination, currentPage: 4 },
    }
    const state = animalsReducer(withPage, setFilters({ breed: '3' }))

    expect(state.pagination.currentPage).toBe(1)
  })

  it('should update current page', () => {
    const state = animalsReducer(initialState, setPage(3))

    expect(state.pagination.currentPage).toBe(3)
  })

  it('should clear all filters and search', () => {
    const dirtyState = {
      ...initialState,
      searchQuery: 'bull',
      filters: { breed: '1', age: '24', animal_type: '2' },
      pagination: { ...initialState.pagination, currentPage: 5 },
    }
    const state = animalsReducer(dirtyState, clearFilters())

    expect(state.searchQuery).toBe('')
    expect(state.filters.breed).toBe('')
    expect(state.filters.age).toBe('')
    expect(state.pagination.currentPage).toBe(1)
  })

  it('should set animals and pagination when getAnimals is fulfilled', () => {
    const action = {
      type: 'animals/getAnimals/fulfilled',
      payload: {
        animals: mockAnimals,
        total_pages: 5,
        total_count: 42,
      },
    }
    const state = animalsReducer(initialState, action)

    expect(state.animals).toHaveLength(2)
    expect(state.pagination.totalPages).toBe(5)
    expect(state.pagination.totalCount).toBe(42)
    expect(state.isLoading).toBe(false)
  })

  it('should set isLoading true when getAnimals is pending', () => {
    const action = { type: 'animals/getAnimals/pending' }
    const state = animalsReducer(initialState, action)

    expect(state.isLoading).toBe(true)
  })

  it('should set error when getAnimals is rejected', () => {
    const action = {
      type: 'animals/getAnimals/rejected',
      payload: 'Failed to load animals.',
    }
    const state = animalsReducer(initialState, action)

    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to load animals.')
  })

})
