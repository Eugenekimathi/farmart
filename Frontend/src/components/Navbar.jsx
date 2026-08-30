import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'
import { setSearchQuery } from '../features/animals/animalsSlice'
import { useState } from 'react'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      dispatch(setSearchQuery(searchTerm))
      navigate('/store')
    }
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        <div className="navbar__logo-icon">F</div>
        <div>
          <span className="navbar__logo-name">Farmart Kenya</span>
          <span className="navbar__logo-tag">Soko la Wakulima</span>
        </div>
      </Link>

      <form className="navbar__search" onSubmit={handleSearch}>
        <div className="navbar__search-inner">
          <span className="navbar__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search livestock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="navbar__search-input"
          />
        </div>
      </form>

      <nav className="navbar__links">
        <Link to="/" className="navbar__link">Home</Link>
        <Link to="/store" className="navbar__link">Store</Link>
        {user && role !== 'farmer' && (
          <Link to="/orders" className="navbar__link">My Orders</Link>
        )}

        {role !== 'farmer' && (
          <Link to="/cart" className="navbar__cart">
            🛒
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
    </header>
  )
}

export default Navbar


