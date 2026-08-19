import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeItem, deleteCartItem } from '../features/cart/cartSlice'
import '../styles/cart.css'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items, isLoading } = useSelector((state) => state.cart)

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price), 0
  )
  const totalSavings = Math.round(subtotal * 0.2)
  const total = subtotal

  const handleRemove = (item) => {
    // Optimistic local remove first
    dispatch(removeItem(item.id))
    // Then sync with backend if we have a cartItemId
    if (item.cartItemId) {
      dispatch(
        deleteCartItem({
          cartItemId: item.cartItemId,
          animalId: item.id,
        })
      )
    }
  }

  // Empty cart state
  if (!isLoading && items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">🛒</div>
        <h2 className="cart-empty__title">Your cart is empty</h2>
        <p className="cart-empty__subtitle">
          Browse the store and add animals to get started
        </p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/store')}
        >
          Browse Store
        </button>
      </div>
    )
  }

  return (
    <div className="cart-page">

      <div className="cart-page__header">
        <h1 className="cart-page__title">Your Cart</h1>
        <p className="cart-page__count">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="cart-page__body">

        {/* Cart items list */}
        <div className="cart-items">
          {items.map((item) => {
            const primaryImage =
              item.images?.find((img) => img.is_primary) ||
              item.images?.[0]

            return (
              <div key={item.id} className="cart-item">

                {/* Image */}
                <div className="cart-item__image-wrap">
                  {primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={item.name}
                      className="cart-item__image"
                    />
                  ) : (
                    <div className="cart-item__image-placeholder">🐄</div>
                  )}
                </div>

                {/* Info */}
                <div className="cart-item__info">
                  <h3 className="cart-item__name">{item.name}</h3>

                  <div className="cart-item__meta">
                    {item.breed?.name && (
                      <span className="cart-item__tag">
                        {item.breed.name}
                      </span>
                    )}
                    {item.animal_type?.name && (
                      <span className="cart-item__tag">
                        {item.animal_type.name}
                      </span>
                    )}
                  </div>

                  <div className="cart-item__details">
                    <span>📍 {item.location}</span>
                    <span>⚖️ {item.age} months</span>
                    <span>
                      {item.gender === 'male' ? '♂ Male' : '♀ Female'}
                    </span>
                  </div>

                  <p className="cart-item__farmer">
                    🌾 {item.farmer?.farm_name || 'Verified Farmer'}
                  </p>
                </div>

                {/* Price and remove */}
                <div className="cart-item__right">
                  <p className="cart-item__price">
                    KSh {Number(item.price).toLocaleString()}
                  </p>
                  <p className="cart-item__savings">
                    Save KSh{' '}
                    {Math.round(item.price * 0.2).toLocaleString()}
                  </p>
                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item)}
                  >
                    Remove
                  </button>
                </div>

              </div>
            )
          })}
        </div>

        {/* Order summary */}
        <div className="cart-summary">

          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Subtotal ({items.length} items)</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--savings">
              <span>💚 Broker savings</span>
              <span>- KSh {totalSavings.toLocaleString()}</span>
            </div>
            <div className="cart-summary__row">
              <span>Delivery</span>
              <span className="cart-summary__free">Arranged with farmer</span>
            </div>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Total</span>
            <span>KSh {total.toLocaleString()}</span>
          </div>

          <button
            className="btn btn--primary btn--full"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <button
            className="btn btn--outline btn--full"
            onClick={() => navigate('/store')}
            style={{ marginTop: '0.65rem' }}
          >
            Continue Shopping
          </button>

          {/* No broker callout */}
          <div className="cart-summary__callout">
            <p>✅ No broker fees</p>
            <p>✅ Pay directly to farmer via M-Pesa</p>
            <p>✅ Verified livestock listings</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CartPage

