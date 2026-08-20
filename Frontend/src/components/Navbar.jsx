import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { user, role } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const handleModeChange = (mode) => {
    navigate(mode === 'farmer' ? '/farmer-portal' : '/store')
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/')
  }

  return (
    <header className="wireframe-navbar">
      <div className="wireframe-navbar__container">
        <Link to="/" className="wireframe-navbar__brand">
          <div className="wireframe-navbar__logo-box">🌿</div>
          <div>
            <span className="wireframe-navbar__title">Farmart Kenya</span>
            <span className="wireframe-navbar__subtitle">// Soko la Wakulima</span>
          </div>
        </Link>

        <nav className="wireframe-navbar__links">
          <Link to="/" className="wireframe-navbar__link">Home</Link>
          <Link to="/store" className="wireframe-navbar__link">Store</Link>
          <div className="wireframe-mode-toggle" aria-label="Choose marketplace mode">
            <button
              type="button"
              className={`wireframe-mode-toggle__btn ${!location.pathname.startsWith('/farmer-portal') ? 'wireframe-mode-toggle__btn--active' : ''}`}
              onClick={() => handleModeChange('buyer')}
            >
              Buyer
            </button>
            <button
              type="button"
              className={`wireframe-mode-toggle__btn ${location.pathname.startsWith('/farmer-portal') ? 'wireframe-mode-toggle__btn--active' : ''}`}
              onClick={() => handleModeChange('farmer')}
            >
              Farmer
            </button>
          </div>
          
          {user && role !== 'farmer' && (
            <Link to="/orders" className="wireframe-navbar__link">My Orders</Link>
          )}

          {role !== 'farmer' && (
            <Link to="/cart" className="wireframe-navbar__cart-btn">
              🛒 Cart
              {items.length > 0 && (
                <span className="wireframe-navbar__cart-count">{items.length}</span>
              )}
            </Link>
          )}

          {!user ? (
            <div className="wireframe-navbar__auth-group">
              <Link to="/login" className="wireframe-btn-sm wireframe-btn-sm--outline">Login</Link>
              <Link to="/register" className="wireframe-btn-sm wireframe-btn-sm--green">Register</Link>
            </div>
          ) : (
            <div className="wireframe-navbar__auth-group">
              <span className="wireframe-navbar__user">Hi, {user.full_name?.split(' ')[0] || 'User'}</span>
              <button onClick={handleLogout} className="wireframe-btn-sm wireframe-btn-sm--outline">Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
