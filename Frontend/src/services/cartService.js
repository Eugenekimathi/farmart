import api from './api'

const getCartId = () => localStorage.getItem('farmart.cartId')

export const fetchCart = async () => {
  const cartId = getCartId()
  if (!cartId) return { cart_items: [] }
  const response = await api.get(`/carts/${cartId}/items`)
  return { cart_items: response.data }
}

export const createCart = async (userId) => {
  const response = await api.post('/carts', { user_id: userId })
  localStorage.setItem('farmart.cartId', response.data.id)
  return response.data
}

export const addToCart = async (animalId, userId) => {
  let cartId = getCartId()
  if (!cartId) {
    if (!userId) throw new Error('You must be logged in')
    const cart = await createCart(userId)
    cartId = cart.id
  }
  const response = await api.post(`/carts/${cartId}/items`, { animal_id: animalId })
  return response.data
}

export const removeFromCart = async (cartItemId) => {
  const cartId = getCartId()
  if (!cartId) return null
  const response = await api.delete(`/carts/${cartId}/items/${cartItemId}`)
  return response.data
}
