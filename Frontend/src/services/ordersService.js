import api from './api'

export const createOrder = async (orderData) => {
  const response = await api.post('/orders', orderData)
  const order = response.data
  // The backend creates order and order items separately.
  if (orderData.items?.length) {
    await Promise.all(orderData.items.map((item) =>
      api.post(`/orders/${order.id}/items`, {
        order_id: order.id,
        animal_id: item.animal_id,
        farmer_id: item.farmer_id,
        price: item.price,
        quantity: 1,
      })
    ))
  }
  return order
}

export const createOrderItem = async (orderId, itemData) => {
  const response = await api.post(`/orders/${orderId}/items`, itemData)
  return response.data
}

export const initiatePayment = async (paymentData) => {
  const response = await api.post('/payments/stkpush', {
    order_id: paymentData.order_id,
    phone_number: paymentData.phone_number,
  })
  return response.data
}

export const checkPaymentStatus = async (checkoutRequestId) => {
  const response = await api.get(`/payments/status/${checkoutRequestId}`)
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
