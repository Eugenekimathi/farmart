import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addFarmerAnimal } from '../features/farmer/farmerSlice'
import { getAnimalTypes, getBreeds } from '../features/animals/animalsSlice'
import AnimalForm from '../components/AnimalForm'
import '../styles/animalForm.css'

const AddAnimalPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isSubmitting, submitError } = useSelector((state) => state.farmer)

  // Load types and breeds for the form dropdowns
  useEffect(() => {
    dispatch(getAnimalTypes())
    dispatch(getBreeds())
  }, [dispatch])

  const handleSubmit = async (formData) => {
    const result = await dispatch(addFarmerAnimal(formData))
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/farmer-portal')
    }
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
        <h1 className="animal-form-page__title">Add New Animal</h1>
        <p className="animal-form-page__subtitle">
          Fill in the details below to list your animal for sale
        </p>
      </div>

      <AnimalForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        error={submitError}
      />
    </div>
  )
}

export default AddAnimalPage
