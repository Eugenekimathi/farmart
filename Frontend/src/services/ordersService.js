import api from './api'

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  // Checkout is atomic on the server: it snapshots cart items, reserves the
  // animals, and creates order items in one transaction.
  return response.data
}

export const createOrderItem = async (orderId, itemData) => {
  const response = await api.post(`/orders/${orderId}/items`, itemData)
  return response.data
}

export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments', {
    order_id: paymentData.order_id,
    amount: paymentData.amount,
    payment_method: paymentData.payment_method || 'MPESA',
    transaction_reference: paymentData.transaction_reference,
  })
  return response.data
}

export const checkPaymentStatus = async (paymentId) => {
  const response = await api.get(`/payments/${paymentId}`)
  return response.data
}

export const fetchMyOrders = async (buyerId) => {
  if (!buyerId) return []
  const response = await api.get('/orders')
  const orders = Array.isArray(response.data) ? response.data : response.data.orders || []
  return orders.filter((order) => String(order.buyer_id) === String(buyerId))
}

export const fetchOrders = async () => {
  const response = await api.get('/orders')
  return Array.isArray(response.data) ? response.data : response.data.orders || []
}

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status })
  return response.data
}
