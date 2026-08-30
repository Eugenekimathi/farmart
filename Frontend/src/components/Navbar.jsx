import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'
import { setSearchQuery } from '../features/animals/animalsSlice'
import { useState } from 'react'

// SVG Icons
const SearchIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const HomeIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const StoreIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
)

const ClipboardListIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
)

const UserIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
)

const MenuIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const CategoryIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m4 9 8 7 8-7" />
    <circle cx="12" cy="9" r="1" />
    <circle cx="12" cy="3" r="1" />
    <circle cx="6" cy="6" r="1" />
    <circle cx="18" cy="6" r="1" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ShieldCheckIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const isActive = (path) => location.pathname === path

  return (
    <>
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
            <span className="navbar__search-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search livestock by type, breed, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="navbar__search-input"
            />
          </div>
        </form>

        <nav className="navbar__links">
          <Link 
            to="/" 
            className={`navbar__link ${isActive('/') ? 'navbar__link--active' : ''}`}
          >
            <HomeIcon />
            <span>Home</span>
          </Link>
          <Link 
            to="/store" 
            className={`navbar__link ${isActive('/store') ? 'navbar__link--active' : ''}`}
          >
            <StoreIcon />
            <span>Store</span>
          </Link>
          {user && role !== 'farmer' && (
            <Link 
              to="/orders" 
              className={`navbar__link ${isActive('/orders') ? 'navbar__link--active' : ''}`}
            >
              <ClipboardListIcon />
              <span>My Orders</span>
            </Link>
          )}

          {role !== 'farmer' && (
            <Link to="/cart" className="navbar__cart">
              <ShoppingBagIcon />
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
              <span className="navbar__user">
                <UserIcon />
                <span style={{ marginLeft: '0.4rem' }}>{user.full_name?.split(' ')[0] || 'User'}</span>
              </span>
              <button onClick={handleLogout} className="btn btn--outline btn--sm" title="Logout">
                <LogOutIcon />
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Secondary Navigation Bar */}
      <nav className="navbar-secondary">
        <div className="navbar-secondary__inner">
          <div className="navbar-secondary__links">
            <Link 
              to="/store" 
              className={`navbar-secondary__link ${isActive('/store') ? 'navbar-secondary__link--active' : ''}`}
            >
              <StoreIcon />
              All Livestock
            </Link>
            <Link 
              to="/store?type=cattle" 
              className="navbar-secondary__link"
            >
              <CategoryIcon />
              Cattle
            </Link>
            <Link 
              to="/store?type=goat" 
              className="navbar-secondary__link"
            >
              <CategoryIcon />
              Goats
            </Link>
            <Link 
              to="/store?type=sheep" 
              className="navbar-secondary__link"
            >
              <CategoryIcon />
              Sheep
            </Link>
            <Link 
              to="/store?type=poultry" 
              className="navbar-secondary__link"
            >
              <CategoryIcon />
              Poultry
            </Link>
          </div>
          <div className="navbar-secondary__links">
            <Link 
              to="/store?verified=true" 
              className="navbar-secondary__link"
            >
              <ShieldCheckIcon />
              Verified Only
            </Link>
            <Link 
              to="/store" 
              className="navbar-secondary__link"
            >
              <MapPinIcon />
              Near Me
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
