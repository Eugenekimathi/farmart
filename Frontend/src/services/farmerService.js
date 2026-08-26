import api from './api'

export const fetchFarmerAnimals = async (farmerId) => {
  const response = await api.get('/animals')
  return response.data.filter((animal) => !farmerId || String(animal.farmer_id) === String(farmerId))
}

export const createAnimal = async (formData) => {
  const response = await api.post('/animals', formData)
  return response.data
}

export const updateAnimal = async (id, formData) => {
  const response = await api.put(`/animals/${id}`, formData)
  return response.data
}

export const deleteAnimal = async (id) => {
  const response = await api.delete(`/animals/${id}`)
  return response.data
}

export const fetchFarmerOrders = async (farmerId) => {
  const response = await api.get('/orders')
  return Array.isArray(response.data) ? response.data : []
}

export const confirmOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status: 'CONFIRMED' })
  return response.data
}

export const rejectOrder = async (orderId) => {
  const response = await api.patch(`/orders/${orderId}/status`, { status: 'REJECTED' })
  return response.data
}
