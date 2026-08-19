import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { updateLocalAnimal } from '../features/animals/animalsSlice'

const EditAnimalPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const animal = useSelector((state) => state.animals.animals.find((item) => item.id === id))
  const [name, setName] = useState(animal?.name || '')
  const [price, setPrice] = useState(animal?.price || '')

  if (!animal) return <div className="wireframe-empty">Animal listing not found.</div>

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(updateLocalAnimal({ ...animal, name, price: Number(price) }))
    navigate('/farmer-portal')
  }

  return (
    <div className="auth-page">
      <form className="auth-card auth-form" onSubmit={handleSubmit}>
        <span className="wireframe-tag-badge">// EDIT LISTING</span>
        <h1 className="auth-card__title">Edit animal</h1>
        <div className="form-group">
          <label className="form-label" htmlFor="animal-name">Name</label>
          <input id="animal-name" className="form-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="animal-price">Price</label>
          <input id="animal-price" type="number" className="form-input" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </div>
        <button type="submit" className="btn btn--primary btn--full">Save Changes</button>
      </form>
    </div>
  )
}

export default EditAnimalPage
