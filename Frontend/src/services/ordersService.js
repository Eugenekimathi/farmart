import api from './api'

export const createOrder = async (orderData) => {
  // orderData = { delivery_address, delivery_phone, items }
  const response = await api.post('/orders', orderData)
  return response.data
}

export const initiatePayment = async (paymentData) => {
  // paymentData = { order_id, phone_number, amount }
  const response = await api.post('/payments/initiate', paymentData)
  return response.data
}

export const checkPaymentStatus = async (orderId) => {
  const response = await api.get(`/payments/status/${orderId}`)
  return response.data
}

export const fetchMyOrders = async () => {
  const response = await api.get('/orders/my-orders')
  return response.data
}

export const fetchOrders = async () => {
  const response = await api.get('/orders')
  return response.data
}

export const confirmOrderApi = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/confirm`)
  return response.data
}

export const rejectOrderApi = async (orderId) => {
  const response = await api.post(`/orders/${orderId}/reject`)
  return response.data
}
