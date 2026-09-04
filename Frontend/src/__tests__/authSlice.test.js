import authReducer, {
  setCredentials,
  logout,
  clearError,
} from '../features/auth/authSlice'

// Mock user returned by the backend
const mockUser = {
  id: 1,
  full_name: 'John Kamau',
  email: 'john@example.com',
  phone: '0712345678',
  role: 'buyer',
  location: 'Nairobi',
}

const mockToken = 'mock.jwt.token'

describe('authSlice', () => {

  const initialState = {
    user: null,
    token: null,
    role: null,
    isLoading: false,
    error: null,
  }

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should set credentials on login', () => {
    const action = setCredentials({ user: mockUser, token: mockToken })
    const state = authReducer(initialState, action)

    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.role).toBe('buyer')
  })

  it('should set role to farmer when farmer logs in', () => {
    const farmerUser = { ...mockUser, role: 'farmer' }
    const action = setCredentials({ user: farmerUser, token: mockToken })
    const state = authReducer(initialState, action)

    expect(state.role).toBe('farmer')
  })

  it('should clear all auth state on logout', () => {
    const loggedInState = {
      user: mockUser,
      token: mockToken,
      role: 'buyer',
      isLoading: false,
      error: null,
    }
    const state = authReducer(loggedInState, logout())

    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.role).toBeNull()
  })

  it('should clear error when clearError is called', () => {
    const errorState = { ...initialState, error: 'Login failed' }
    const state = authReducer(errorState, clearError())

    expect(state.error).toBeNull()
  })

  it('should set isLoading true when login is pending', () => {
    const action = { type: 'auth/login/pending' }
    const state = authReducer(initialState, action)

    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('should save user and token when login is fulfilled', () => {
    const action = {
      type: 'auth/login/fulfilled',
      payload: { user: mockUser, token: mockToken },
    }
    const state = authReducer(initialState, action)

    expect(state.isLoading).toBe(false)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.role).toBe('buyer')
  })

  it('should save error message when login is rejected', () => {
    const action = {
      type: 'auth/login/rejected',
      payload: 'Invalid credentials',
    }
    const state = authReducer(initialState, action)

    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Invalid credentials')
  })

})
