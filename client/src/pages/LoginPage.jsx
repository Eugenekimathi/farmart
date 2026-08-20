import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../features/auth/authSlice'
import '../styles/auth.css'

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { isLoading, error, user, role } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    if (!formData.email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email'
    if (!formData.password) errors.password = 'Password is required'
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    dispatch(login(formData))
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-card__header">
          <img src="/logo.svg" alt="Farmart logo" className="auth-card__logo-img" />
          <h2 className="auth-card__title">Welcome back</h2>
          <p className="auth-card__subtitle">Login to your account</p>
        </div>

        {error && (
          <div className="auth-card__error" role="alert">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
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
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
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

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-card__link">Register here</Link>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
