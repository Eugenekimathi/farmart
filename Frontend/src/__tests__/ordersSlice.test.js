import ordersReducer, {
  resetCheckout,
  clearOrderError,
} from '../features/orders/ordersSlice'

const mockOrder = {
  id: 101,
  status: 'pending',
  total_amount: '95000',
  buyer_id: 5,
}

const mockFarmerOrders = [
  { id: 201, status: 'pending', total_amount: '95000' },
  { id: 202, status: 'paid', total_amount: '72000' },
]

describe('ordersSlice', () => {

  const initialState = {
    orders: [],
    farmerOrders: [],
    currentOrder: null,
    paymentStatus: null,
    isLoading: false,
    isFarmerOrdersLoading: false,
    isPaymentLoading: false,
    error: null,
    paymentError: null,
  }

  it('should return the initial state', () => {
    expect(ordersReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('should reset checkout state', () => {
    const dirtyState = {
      ...initialState,
      currentOrder: mockOrder,
      paymentStatus: 'stk_sent',
      error: 'some error',
      paymentError: 'payment failed',
    }
    const state = ordersReducer(dirtyState, resetCheckout())

    expect(state.currentOrder).toBeNull()
    expect(state.paymentStatus).toBeNull()
    expect(state.error).toBeNull()
    expect(state.paymentError).toBeNull()
  })

  it('should clear order errors', () => {
    const errorState = {
      ...initialState,
      error: 'Failed to place order.',
      paymentError: 'Payment failed.',
    }
    const state = ordersReducer(errorState, clearOrderError())

    expect(state.error).toBeNull()
    expect(state.paymentError).toBeNull()
  })

  it('should save current order when placeOrder is fulfilled', () => {
    const action = {
      type: 'orders/placeOrder/fulfilled',
      payload: mockOrder,
    }
    const state = ordersReducer(initialState, action)

    expect(state.currentOrder).toEqual(mockOrder)
    expect(state.isLoading).toBe(false)
  })

  it('should set isLoading when placeOrder is pending', () => {
    const action = { type: 'orders/placeOrder/pending' }
    const state = ordersReducer(initialState, action)

    expect(state.isLoading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('should save error when placeOrder is rejected', () => {
    const action = {
      type: 'orders/placeOrder/rejected',
      payload: 'Failed to place order.',
    }
    const state = ordersReducer(initialState, action)

    expect(state.isLoading).toBe(false)
    expect(state.error).toBe('Failed to place order.')
  })

  it('should set paymentStatus to stk_sent when startPayment is fulfilled', () => {
    const action = { type: 'orders/startPayment/fulfilled' }
    const state = ordersReducer(initialState, action)

    expect(state.paymentStatus).toBe('stk_sent')
    expect(state.isPaymentLoading).toBe(false)
  })

  it('should update farmer order status to confirmed', () => {
    const withOrders = { ...initialState, farmerOrders: mockFarmerOrders }
    const action = {
      type: 'orders/confirmOrder/fulfilled',
      payload: { orderId: 201 },
    }
    const state = ordersReducer(withOrders, action)

    expect(state.farmerOrders[0].status).toBe('confirmed')
    expect(state.farmerOrders[1].status).toBe('paid') // unchanged
  })

  it('should update farmer order status to rejected', () => {
    const withOrders = { ...initialState, farmerOrders: mockFarmerOrders }
    const action = {
      type: 'orders/rejectOrder/fulfilled',
      payload: { orderId: 202 },
    }
    const state = ordersReducer(withOrders, action)

    expect(state.farmerOrders[1].status).toBe('rejected')
    expect(state.farmerOrders[0].status).toBe('pending') // unchanged
  })

})
