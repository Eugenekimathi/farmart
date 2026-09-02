import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../features/auth/authSlice'
import '../styles/auth.css'

// SVG Icons
const ShoppingBagIcon = () => (
  <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SproutIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2" />
    <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6" />
  </svg>
)

const RegisterPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isLoading, error, user, role } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    location: '',
    farm_name: '',
    farm_location: '',
    farm_description: '',
  })

  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    if (user) {
      role === 'farmer' ? navigate('/farmer-portal') : navigate('/store')
    }
  }, [user, role, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const errors = {}
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required'
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^(\+254|0)[17]\d{7,8}$/.test(formData.phone)) errors.phone = 'Enter a valid Kenyan phone number'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 8) errors.password = 'At least 8 characters'
    if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match'
    if (!formData.location.trim()) errors.location = 'Location is required'
    if (formData.role === 'farmer') {
      if (!formData.farm_name.trim()) errors.farm_name = 'Farm name is required'
      if (!formData.farm_location.trim()) errors.farm_location = 'Farm location is required'
    }
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    const payload = {
      ...formData,
      role: formData.role.toUpperCase(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      full_name: formData.full_name.trim(),
      location: formData.location.trim(),
    }
    if (formData.role === 'farmer') {
      payload.farm_name = formData.farm_name.trim()
      payload.farm_location = formData.farm_location.trim()
      payload.farm_description = formData.farm_description.trim() || null
    } else {
      delete payload.farm_name
      delete payload.farm_location
      delete payload.farm_description
    }
    delete payload.confirmPassword
    dispatch(register(payload))
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-card__header">
          <div className="auth-card__logo-mark">
            <ShoppingBagIcon />
          </div>
          <h2 className="auth-card__title">Create an account</h2>
          <p className="auth-card__subtitle">Join the Farmart marketplace</p>
        </div>

        {error && (
          <div className="auth-card__error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-toggle__btn ${formData.role === 'buyer' ? 'role-toggle__btn--active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'buyer' }))}
              >
                <span className="role-toggle__btn-icon">
                  <UserIcon />
                </span>
                <span className="role-toggle__btn-label">Buyer</span>
              </button>
              <button
                type="button"
                className={`role-toggle__btn ${formData.role === 'farmer' ? 'role-toggle__btn--active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'farmer' }))}
              >
                <span className="role-toggle__btn-icon">
                  <SproutIcon />
                </span>
                <span className="role-toggle__btn-label">Farmer</span>
              </button>
            </div>
          </div>

          {formData.role === 'farmer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Farm Name</label>
                  <input type="text" name="farm_name" value={formData.farm_name} onChange={handleChange} placeholder="e.g. Green Valley Farm" className={`form-input ${formErrors.farm_name ? 'form-input--error' : ''}`} />
                  {formErrors.farm_name && <span className="form-error">{formErrors.farm_name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Farm Location</label>
                  <input type="text" name="farm_location" value={formData.farm_location} onChange={handleChange} placeholder="e.g. Naivasha, Nakuru" className={`form-input ${formErrors.farm_location ? 'form-input--error' : ''}`} />
                  {formErrors.farm_location && <span className="form-error">{formErrors.farm_location}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Farm Description <span className="form-label__optional">(optional)</span></label>
                <textarea name="farm_description" value={formData.farm_description} onChange={handleChange} placeholder="Tell buyers about your farm" rows={3} className="form-input form-textarea" />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Kamau"
                className={`form-input ${formErrors.full_name ? 'form-input--error' : ''}`}
              />
              {formErrors.full_name && (
                <span className="form-error">{formErrors.full_name}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0712345678"
                className={`form-input ${formErrors.phone ? 'form-input--error' : ''}`}
              />
              {formErrors.phone && (
                <span className="form-error">{formErrors.phone}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`form-input ${formErrors.email ? 'form-input--error' : ''}`}
            />
            {formErrors.email && (
              <span className="form-error">{formErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Nakuru, Kenya"
              className={`form-input ${formErrors.location ? 'form-input--error' : ''}`}
            />
            {formErrors.location && (
              <span className="form-error">{formErrors.location}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`form-input ${formErrors.password ? 'form-input--error' : ''}`}
              />
              {formErrors.password && (
                <span className="form-error">{formErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`form-input ${formErrors.confirmPassword ? 'form-input--error' : ''}`}
              />
              {formErrors.confirmPassword && (
                <span className="form-error">{formErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full btn--lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Login here</Link>
        </p>

      </div>
    </div>
  )
}

export default RegisterPage
