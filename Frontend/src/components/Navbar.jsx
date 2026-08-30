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
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon"></div>
          <div>
            <span className="navbar__logo-name">Farmart Kenya</span>
            <span className="navbar__logo-tag">// Soko la Wakulima</span>
          </div>
        </Link>

        <nav className="navbar__links">
          <Link to="/" className="navbar__link">Home</Link>
          <Link to="/store" className="navbar__link">Store</Link>
          <div className="navbar__mode-toggle" aria-label="Choose marketplace mode">
            <button
              type="button"
              className={`navbar__mode-btn ${!location.pathname.startsWith('/farmer-portal') ? 'navbar__mode-btn--active' : ''}`}
              onClick={() => handleModeChange('buyer')}
            >
              Buyer
            </button>
            <button
              type="button"
              className={`navbar__mode-btn ${location.pathname.startsWith('/farmer-portal') ? 'navbar__mode-btn--active' : ''}`}
              onClick={() => handleModeChange('farmer')}
            >
              Farmer
            </button>
          </div>
          
          {user && role !== 'farmer' && (
            <Link to="/orders" className="navbar__link">My Orders</Link>
          )}

          {role !== 'farmer' && (
            <Link to="/cart" className="navbar__cart">
              
              {items.length > 0 && (
                <span className="navbar__cart-count">{items.length}</span>
              )}
            </Link>
          )}

          {!user ? (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn--outline btn--sm">Login</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Register</Link>
            </div>
          ) : (
            <div className="navbar__auth">
              <span className="navbar__user">Hi, {user.full_name?.split(' ')[0] || 'User'}</span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm">Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar


