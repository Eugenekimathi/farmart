import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addLocalAnimal } from '../features/animals/animalsSlice'
import '../styles/farmerPortal.css'

const AddAnimalPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', breed: '', location: '', weight: '', age: '', price: '', image: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    dispatch(addLocalAnimal({
      id: `local-${Date.now()}`,
      name: form.name,
      breed: { id: `local-${form.breed}`, name: form.breed },
      animal_type: { id: 't1', name: 'Cattle' },
      location: form.location,
      weight: form.weight,
      age: Number(form.age),
      price: Number(form.price),
      images: form.image ? [{ image_url: form.image, is_primary: true }] : [],
      savings: 0,
      kvb_certified: false,
      pasture_raised: false,
      direct_delivery: false,
    }))
    navigate('/farmer-portal')
  }

  return (
    <div className="auth-page">
      <form className="auth-card auth-card--wide auth-form" onSubmit={handleSubmit}>
        <span className="wireframe-tag-badge">// NEW LISTING</span>
        <h1 className="auth-card__title">Add an animal</h1>
        <p className="auth-card__subtitle">Publish a listing with a real farm photo.</p>
        {['name', 'breed', 'location', 'weight', 'age', 'price'].map((field) => (
          <div className="form-group" key={field}>
            <label className="form-label" htmlFor={field}>{field.replace('_', ' ')}</label>
            <input id={field} name={field} type={['age', 'price'].includes(field) ? 'number' : 'text'} value={form[field]} onChange={handleChange} className="form-input" required />
          </div>
        ))}
        <div className="form-group">
          <label className="form-label" htmlFor="animal-image">Animal photo</label>
          <input id="animal-image" type="file" accept="image/*" onChange={handleImageChange} className="form-input" />
        </div>
        <button type="submit" className="btn btn--primary btn--full">Publish Listing</button>
      </form>
    </div>
  )
}

export default AddAnimalPage
