import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import '../styles/animalForm.css'

const AnimalForm = ({ initialData = null, onSubmit, isLoading, error }) => {
  const { animalTypes = [], breeds = [] } = useSelector((state) => state.animals || {})

  const [formData, setFormData] = useState({
    name: '',
    animal_type_id: '',
    breed_id: '',
    gender: '',
    age: '',
    price: '',
    location: '',
    description: '',
    status: 'available',
  })

  const [formErrors, setFormErrors] = useState({})
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [primaryIndex, setPrimaryIndex] = useState(0)

  // Pre-fill form when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        animal_type_id: initialData.animal_type_id || '',
        breed_id: initialData.breed_id || '',
        gender: initialData.gender || '',
        age: initialData.age || '',
        price: initialData.price || '',
        location: initialData.location || '',
        description: initialData.description || '',
        status: initialData.status || 'available',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Handle image file selection and generate previews
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    const validFiles = files.filter((file) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024
    )
    if (validFiles.length !== files.length) {
      setFormErrors((prev) => ({ ...prev, images: 'Use JPG, PNG, or WEBP images up to 5MB each' }))
    }

    // Limit to 5 images
    const selected = validFiles.slice(0, 5)
    setImageFiles(selected)

    // Generate preview URLs
    const previews = selected.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
    setPrimaryIndex(0)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Animal name is required'
    if (!formData.animal_type_id) errors.animal_type_id = 'Select an animal type'
    if (!formData.gender) errors.gender = 'Select gender'
    if (!formData.age) errors.age = 'Age is required'
    else if (isNaN(formData.age) || Number(formData.age) <= 0)
      errors.age = 'Enter a valid age in months'
    if (!formData.price) errors.price = 'Price is required'
    else if (isNaN(formData.price) || Number(formData.price) <= 0)
      errors.price = 'Enter a valid price'
    if (!formData.location.trim()) errors.location = 'Location is required'
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Build FormData to send files + fields together
    const payload = new FormData()

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value)
    })

    imageFiles.forEach((file) => {
      payload.append('images', file)
    })

    payload.append('primary_image_index', primaryIndex)

    onSubmit(payload)
  }

  // Filter breeds based on selected animal type
  const filteredBreeds = formData.animal_type_id
    ? breeds.filter(
      (b) => String(b.animal_type_id) === String(formData.animal_type_id)
    )
    : breeds

  return (
    <form onSubmit={handleSubmit} className="animal-form">

      {/* API error */}
      {error && (
        <div className="animal-form__error">{error}</div>
      )}

      {/* Two column grid */}
      <div className="animal-form__grid">

        {/* Animal name */}
        <div className="form-group animal-form__full">
          <label className="form-label">Animal Name / Identifier</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Purebred Boran Bull"
            className={`form-input ${formErrors.name ? 'form-input--error' : ''}`}
          />
          {formErrors.name && (
            <span className="form-error">{formErrors.name}</span>
          )}
        </div>

        {/* Animal type */}
        <div className="form-group">
          <label className="form-label">Animal Type</label>
          <select
            name="animal_type_id"
            value={formData.animal_type_id}
            onChange={(e) => {
              handleChange(e)
              // Reset breed when type changes
              setFormData((prev) => ({ ...prev, breed_id: '' }))
            }}
            className={`form-input ${formErrors.animal_type_id ? 'form-input--error' : ''}`}
          >
            <option value="">Select type</option>
            {animalTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {formErrors.animal_type_id && (
            <span className="form-error">{formErrors.animal_type_id}</span>
          )}
        </div>

        {/* Breed */}
        <div className="form-group">
          <label className="form-label">Breed</label>
          <select
            name="breed_id"
            value={formData.breed_id}
            onChange={handleChange}
            className={`form-input ${formErrors.breed_id ? 'form-input--error' : ''}`}
            disabled={!formData.animal_type_id}
          >
            <option value="">
              {formData.animal_type_id
                ? 'Not specified'
                : 'Select type first'}
            </option>
            {filteredBreeds.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
          {formErrors.breed_id && (
            <span className="form-error">{formErrors.breed_id}</span>
          )}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label className="form-label">Gender</label>
          <div className="gender-toggle">
            <button
              type="button"
              className={`gender-toggle__btn ${formData.gender === 'male' ? 'gender-toggle__btn--active' : ''}`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, gender: 'male' }))
              }
            >
              ♂ Male
            </button>
            <button
              type="button"
              className={`gender-toggle__btn ${formData.gender === 'female' ? 'gender-toggle__btn--active' : ''}`}
              onClick={() =>
                setFormData((prev) => ({ ...prev, gender: 'female' }))
              }
            >
              ♀ Female
            </button>
          </div>
          {formErrors.gender && (
            <span className="form-error">{formErrors.gender}</span>
          )}
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label">Age (months)</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="e.g. 24"
            min="1"
            className={`form-input ${formErrors.age ? 'form-input--error' : ''}`}
          />
          {formErrors.age && (
            <span className="form-error">{formErrors.age}</span>
          )}
        </div>

        {/* Price */}
        <div className="form-group">
          <label className="form-label">Price (KSh)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g. 95000"
            min="1"
            className={`form-input ${formErrors.price ? 'form-input--error' : ''}`}
          />
          {formErrors.price && (
            <span className="form-error">{formErrors.price}</span>
          )}
        </div>

        {/* Location */}
        <div className="form-group">
          <label className="form-label">Animal Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Naivasha, Kenya"
            className={`form-input ${formErrors.location ? 'form-input--error' : ''}`}
          />
          {formErrors.location && (
            <span className="form-error">{formErrors.location}</span>
          )}
        </div>

        {/* Status — only shown when editing */}
        {initialData && (
          <div className="form-group">
            <label className="form-label">Listing Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-input"
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        )}

        {/* Description — full width */}
        <div className="form-group animal-form__full">
          <label className="form-label">
            Description{' '}
            <span className="form-label__optional">(optional)</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the animal — health, temperament, feeding history..."
            rows={4}
            className="form-input form-textarea"
          />
        </div>

      </div>

      {/* Image upload */}
      <div className="animal-form__images">
        <label className="form-label">
          Photos{' '}
          <span className="form-label__optional">(up to 5 images)</span>
        </label>

        {formErrors.images && (
          <span className="form-error">{formErrors.images}</span>
        )}
        <label className="image-upload-box">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="image-upload-box__input"
          />
          <div className="image-upload-box__inner">
            <span className="image-upload-box__icon">📷</span>
            <p className="image-upload-box__text">
              Click to upload photos
            </p>
            <p className="image-upload-box__sub">
              JPG, PNG up to 5MB each
            </p>
          </div>
        </label>

        {/* Image previews */}
        {imagePreviews.length > 0 && (
          <div className="image-previews">
            <p className="image-previews__label">
              Click an image to set it as primary (shown first)
            </p>
            <div className="image-previews__grid">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className={`image-preview ${index === primaryIndex ? 'image-preview--primary' : ''}`}
                  onClick={() => setPrimaryIndex(index)}
                >
                  <img src={src} alt={`Preview ${index + 1}`} />
                  {index === primaryIndex && (
                    <span className="image-preview__badge">Primary</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing images when editing */}
        {initialData?.images?.length > 0 && imagePreviews.length === 0 && (
          <div className="image-previews">
            <p className="image-previews__label">Current photos</p>
            <div className="image-previews__grid">
              {initialData.images.map((img, index) => (
                <div
                  key={img.id || index}
                  className={`image-preview ${img.is_primary ? 'image-preview--primary' : ''}`}
                >
                  <img src={img.image_url} alt={`Photo ${index + 1}`} />
                  {img.is_primary && (
                    <span className="image-preview__badge">Primary</span>
                  )}
                </div>
              ))}
            </div>
            <p className="image-previews__replace">
              Upload new photos above to replace existing ones
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="animal-form__footer">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
        >
          {isLoading
            ? initialData
              ? 'Saving changes...'
              : 'Adding animal...'
            : initialData
              ? 'Save Changes'
              : 'Add Animal'}
        </button>
      </div>

    </form>
  )
}

export default AnimalForm