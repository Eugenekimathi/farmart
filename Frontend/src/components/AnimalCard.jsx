import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, syncAddToCart } from '../features/cart/cartSlice'

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

const ShieldCheckIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const ShoppingBagIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const CheckIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const FALLBACK_IMAGES = {
  cattle: '/placeholder.svg',
  sheep: '/placeholder.svg',
  goat: '/placeholder.svg',
}

const AnimalCard = ({ animal }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items } = useSelector((state) => state.cart)
  const isInCart = items.some((item) => item.id === animal.id)
  const isAvailable = animal.status?.toUpperCase() === 'AVAILABLE'

  const primaryImage =
    animal.images?.find((img) => img.is_primary) || animal.images?.[0]
  const animalType = animal.animal_type?.name?.toLowerCase()
  const fallbackImage = FALLBACK_IMAGES[animalType] || FALLBACK_IMAGES.cattle
  const imageUrl = primaryImage?.image_url || fallbackImage

  const handleBuyDirect = (e) => {
    e.stopPropagation()
    if (!isAvailable) return
    dispatch(addItem(animal))
    dispatch(syncAddToCart(animal.id))
  }

  const handleCardClick = () => {
    navigate(`/store/${animal.id}`)
  }

  const formattedPrice = `KSh ${Number(animal.price).toLocaleString()}`
  const savingsAmount = animal.savings
    ? animal.savings
    : Math.round(animal.price * 0.25)
  const formattedSavings = `Save KSh ${savingsAmount.toLocaleString()} — No Broker Cut!`

  const locationText = animal.location || 'Kenya'
  const weightText = animal.weight || `${animal.age || 24} mo`

  return (
    <div className="animal-card" onClick={handleCardClick}>
      <div className="animal-card__image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={animal.name}
            className="animal-card__image"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = fallbackImage
            }}
          />
        ) : (
          <div className="animal-card__image-placeholder">
            <span>No image</span>
          </div>
        )}
        
        {/* Verified badge overlay */}
        {animal.farmer?.verified && (
          <div className="animal-card__verified-badge">
            <ShieldCheckIcon />
            <span>Verified</span>
          </div>
        )}
      </div>

      <div className="animal-card__body">
        <h3 className="animal-card__name">{animal.name}</h3>

        <div className="animal-card__meta">
          <span className="animal-card__meta-item">
            <MapPinIcon />
            {locationText}
          </span>
          <span className="animal-card__meta-item">
            <ScaleIcon />
            {weightText}
          </span>
        </div>

        <div className="animal-card__price">{formattedPrice}</div>

        <div className="animal-card__savings">
          {formattedSavings}
        </div>

        <button
          className={`btn btn--primary btn--full btn--sm ${isInCart ? 'btn--in-cart' : ''}`}
          onClick={handleBuyDirect}
          disabled={!isAvailable}
        >
          {isInCart ? (
            <>
              <CheckIcon />
              Added to Cart
            </>
          ) : isAvailable ? (
            <>
              <ShoppingBagIcon />
              Buy Direct
            </>
          ) : (
            'Not Available'
          )}
        </button>
      </div>
    </div>
  )
}

export default AnimalCard
