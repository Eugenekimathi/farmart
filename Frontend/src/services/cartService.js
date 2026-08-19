import api from './api'

export const fetchCart = async () => {
  const response = await api.get('/cart')
  return response.data
}

export const addToCart = async (animalId) => {
  const response = await api.post('/cart/items', { animal_id: animalId })
  return response.data
}

export const removeFromCart = async (cartItemId) => {
  const response = await api.delete(`/cart/items/${cartItemId}`)
  return response.data
}

export const clearCartApi = async () => {
  const response = await api.delete('/cart')
  return response.data
}
