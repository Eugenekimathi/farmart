import api from './api'

export const fetchAnimals = async ({ page = 1, search = '', filters = {} }) => {
  const params = {
    page,
    per_page: 9,
    ...(search && { search }),
    ...(filters.breed && { breed_id: filters.breed }),
    ...(filters.age && { age: filters.age }),
    ...(filters.animal_type && { animal_type_id: filters.animal_type }),
  }
  const response = await api.get('/animals', { params })
  return response.data
}

export const fetchAnimalById = async (id) => {
  const response = await api.get(`/animals/${id}`)
  return response.data
}

export const fetchAnimalTypes = async () => {
  const response = await api.get('/animal-types')
  return response.data
}

export const fetchBreeds = async (animalTypeId = null) => {
  const params = animalTypeId ? { animal_type_id: animalTypeId } : {}
  const response = await api.get('/breeds', { params })
  return response.data
}
