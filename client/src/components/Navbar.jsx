import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { clearCart } from '../features/cart/cartSlice'
import { setSearchQuery } from '../features/animals/animalsSlice'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, role } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const handleSearch = (e) => {
    dispatch(setSearchQuery(e.target.value))
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    navigate('/store')
  }

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearCart())
    navigate('/')
  }

  return (
    <nav className="navbar">

      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-icon">[%]</span>
        <div>
          <span className="navbar__logo-name">Farmart Kenya</span>
          <span className="navbar__logo-tag">// BETA-DEV</span>
        </div>
      </Link>

      <form className="navbar__search" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Tafuta mifugo hapa..."
          onChange={handleSearch}
          className="navbar__search-input"
        />
      </form>

      <div className="navbar__links">
        <Link to="/store" className="navbar__link">Store</Link>

        {role === 'farmer' && (
          <Link to="/farmer-portal" className="navbar__link">Farmer Portal</Link>
        )}

        {user && role !== 'farmer' && (
          <Link to="/orders" className="navbar__link">Orders</Link>
        )}

        {user && role !== 'farmer' && (
          <Link to="/cart" className="navbar__cart">
            🛒
            {items.length > 0 && (
              <span className="navbar__cart-count">{items.length}</span>
            )}
          </Link>
        )}

        {!user ? (
          <div className="navbar__auth">
            <Link to="/register" className="btn btn--outline">Register</Link>
            <Link to="/login" className="btn btn--primary">Login</Link>
          </div>
        ) : (
          <div className="navbar__auth">
            <span className="navbar__user">Hi, {user.full_name?.split(' ')[0]}</span>
            <button onClick={handleLogout} className="btn btn--outline">Logout</button>
          </div>
        )}
      </div>

    </nav>
  )
}

export default Navbar
