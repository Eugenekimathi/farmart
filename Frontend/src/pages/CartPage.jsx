import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { removeItem, deleteCartItem, updateQuantity } from '../features/cart/cartSlice'
import '../styles/cart.css'

// SVG Icons
const MapPinIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const ScaleIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
)

const TrashIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
)

const UserIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const CheckIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items, isLoading } = useSelector((state) => state.cart)

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) * (item.quantity || 1)),
    0
  )
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

  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return
    dispatch(updateQuantity({ itemId, quantity: newQty }))
  }

  // Empty cart state
  if (!isLoading && items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 className="cart-empty__title">Your cart is empty</h2>
        <p className="cart-empty__subtitle">
          Browse the store and add animals to get started
        </p>
        <button
          className="btn btn--primary btn--lg"
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
        <span className="cart-page__count">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="cart-page__body">

        {/* Cart items list */}
        <div className="cart-items">
          {items.map((item) => {
            const primaryImage =
              item.images?.find((img) => img.is_primary) ||
              item.images?.[0]
            
            const quantity = item.quantity || 1

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
                    <div className="cart-item__image-placeholder">
                      <UserIcon />
                    </div>
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
                    <span className="cart-item__detail-item">
                      <MapPinIcon />
                      {item.location}
                    </span>
                    <span className="cart-item__detail-item">
                      <ScaleIcon />
                      {item.age} months
                    </span>
                    <span className="cart-item__detail-item">
                      {item.gender === 'male' ? '♂ Male' : '♀ Female'}
                    </span>
                  </div>

                  <p className="cart-item__farmer">
                    <UserIcon />
                    {item.farmer?.farm_name || 'Verified Farmer'}
                  </p>

                  {/* Quantity controls */}
                  <div className="cart-item__quantity">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleQuantityChange(item.id, quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      −
                    </button>
                    <span className="cart-item__qty-value">{quantity}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => handleQuantityChange(item.id, quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and remove */}
                <div className="cart-item__right">
                  <p className="cart-item__price">
                    KSh {(Number(item.price) * quantity).toLocaleString()}
                  </p>

                  <button
                    className="cart-item__remove"
                    onClick={() => handleRemove(item)}
                  >
                    <TrashIcon />
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
            className="btn btn--accent btn--full btn--lg"
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout
          </button>

          <button
            className="btn btn--outline btn--full"
            onClick={() => navigate('/store')}
            style={{ marginTop: 'var(--space-md)' }}
          >
            Continue Shopping
          </button>

          {/* No broker callout */}
          <div className="cart-summary__callout">
            <p><CheckIcon /> No broker fees</p>
            <p><CheckIcon /> Pay directly to farmer via M-Pesa</p>
            <p><CheckIcon /> Verified livestock listings</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CartPage
