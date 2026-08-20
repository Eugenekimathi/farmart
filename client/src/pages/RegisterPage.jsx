import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../features/auth/authSlice'
import '../styles/auth.css'

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
    else if (formData.password.length < 6) errors.password = 'At least 6 characters'
    if (formData.confirmPassword !== formData.password) errors.confirmPassword = 'Passwords do not match'
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
    const payload = { ...formData }
    delete payload.confirmPassword
    dispatch(register(payload))
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        <div className="auth-card__header">
          <img src="/logo.svg" alt="Farmart logo" className="auth-card__logo-img" />
          <h2 className="auth-card__title">Create an account</h2>
          <p className="auth-card__subtitle">Join the marketplace</p>
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
                🛒 Buyer
              </button>
              <button
                type="button"
                className={`role-toggle__btn ${formData.role === 'farmer' ? 'role-toggle__btn--active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, role: 'farmer' }))}
              >
                🌾 Farmer
              </button>
            </div>
          </div>

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
            className="btn btn--primary btn--full"
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
