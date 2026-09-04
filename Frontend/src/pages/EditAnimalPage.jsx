import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { editFarmerAnimal } from '../features/farmer/farmerSlice'
import { getAnimalById } from '../features/animals/animalsSlice'
import { getAnimalTypes, getBreeds } from '../features/animals/animalsSlice'
import AnimalForm from '../components/AnimalForm'
import '../styles/animalForm.css'

const EditAnimalPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isSubmitting, submitError } = useSelector((state) => state.farmer)
  const { selectedAnimal, isLoading } = useSelector((state) => state.animals)

  // Load the animal's current data and form dropdowns
  useEffect(() => {
    dispatch(getAnimalById(id))
    dispatch(getAnimalTypes())
    dispatch(getBreeds())
  }, [dispatch, id])

  const handleSubmit = async (formData) => {
    const result = await dispatch(
      editFarmerAnimal({ id, formData })
    )
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/farmer-portal')
    }
  }

  if (isLoading) {
    return (
      <div className="animal-form-page">
        <div className="animal-form-page__loading">
          <div className="spinner" />
          <p>Loading animal data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animal-form-page">
      <div className="animal-form-page__header">
        <button
          className="animal-form-page__back"
          onClick={() => navigate('/farmer-portal')}
        >
          ← Back to Portal
        </button>
        <h1 className="animal-form-page__title">Edit Listing</h1>
        <p className="animal-form-page__subtitle">
          Update the details for{' '}
          <strong>{selectedAnimal?.name}</strong>
        </p>
      </div>

      {/* Pass existing animal data to pre-fill the form */}
      <AnimalForm
        initialData={selectedAnimal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={submitError}
      />
    </div>
  )
}

export default EditAnimalPage
