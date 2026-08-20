import cartReducer, {
  addItem,
  removeItem,
  clearCart,
} from '../features/cart/cartSlice'

const mockAnimal = {
  id: 1,
  name: 'Purebred Boran Bull',
  price: '95000',
  location: 'Naivasha',
  age: 24,
  gender: 'male',
  images: [],
}

const mockAnimal2 = {
  id: 2,
  name: 'Sahiwal Heifer',
  price: '72000',
  location: 'Nakuru',
  age: 18,
  gender: 'female',
  images: [],
}

describe('cartSlice', () => {

  const initialState = {
    items: [],
    isLoading: false,
    error: null,
  }

  it('should return the initial state', () => {
    expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should add an item to the cart', () => {
    const state = cartReducer(initialState, addItem(mockAnimal))

    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe(1)
    expect(state.items[0].name).toBe('Purebred Boran Bull')
  })

  it('should not add duplicate items', () => {
    let state = cartReducer(initialState, addItem(mockAnimal))
    state = cartReducer(state, addItem(mockAnimal))

    expect(state.items).toHaveLength(1)
  })

  it('should add multiple different items', () => {
    let state = cartReducer(initialState, addItem(mockAnimal))
    state = cartReducer(state, addItem(mockAnimal2))

    expect(state.items).toHaveLength(2)
  })

  it('should remove an item by id', () => {
    let state = cartReducer(initialState, addItem(mockAnimal))
    state = cartReducer(state, addItem(mockAnimal2))
    state = cartReducer(state, removeItem(1))

    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe(2)
  })

  it('should clear all items from the cart', () => {
    let state = cartReducer(initialState, addItem(mockAnimal))
    state = cartReducer(state, addItem(mockAnimal2))
    state = cartReducer(state, clearCart())

    expect(state.items).toHaveLength(0)
  })

  it('should not error when removing an item that does not exist', () => {
    const state = cartReducer(initialState, removeItem(999))
    expect(state.items).toHaveLength(0)
  })

})
