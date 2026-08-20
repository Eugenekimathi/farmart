import api from './api'

export const fetchFarmerAnimals = async () => {
  const response = await api.get('/farmer/animals')
  return response.data
}

export const createAnimal = async (formData) => {
  const response = await api.post('/farmer/animals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateAnimal = async (id, formData) => {
  const response = await api.put(`/farmer/animals/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const deleteAnimal = async (id) => {
  const response = await api.delete(`/farmer/animals/${id}`)
  return response.data
}

export const fetchFarmerOrders = async () => {
  const response = await api.get('/farmer/orders')
  return response.data
}

export const confirmOrder = async (orderId) => {
  const response = await api.patch(`/farmer/orders/${orderId}/confirm`)
  return response.data
}

export const rejectOrder = async (orderId) => {
  const response = await api.patch(`/farmer/orders/${orderId}/reject`)
  return response.data
}
