import api from './api'

export const fetchAnimals = async ({ page = 1, search = '', filters = {} }) => {
  const params = {
    ...(filters.breed && { breed_id: filters.breed }),
    ...(filters.animal_type && { animal_type_id: filters.animal_type }),
    ...(filters.min_age && { min_age: filters.min_age }),
    ...(filters.max_age && { max_age: filters.max_age }),
  }
  const response = await api.get(search || Object.keys(params).length ? '/animals/search' : '/animals', { params: { ...params, page, per_page: 9 } })
  const animals = Array.isArray(response.data) ? response.data : response.data.animals || []
  return {
    animals,
    total_pages: response.data.total_pages || 1,
    total_count: response.data.total_count ?? animals.length,
    current_page: response.data.current_page || page,
  }
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
