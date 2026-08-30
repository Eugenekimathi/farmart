import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, syncAddToCart } from '../features/cart/cartSlice'

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
          <div className="animal-card__image-placeholder">🐄 Livestock Photo</div>
        )}
      </div>

      <div className="animal-card__body">
        <h3 className="animal-card__name">{animal.name}</h3>

        <div className="animal-card__meta">
          <span className="animal-card__location">📍 {locationText}</span>
          <span className="animal-card__weight">⚖️ {weightText}</span>
        </div>

        <div className="animal-card__price">{formattedPrice}</div>

        <div className="animal-card__savings">
          {formattedSavings}
        </div>

        <button
          className={`btn btn--primary btn--full ${isInCart ? 'btn--in-cart' : ''}`}
          onClick={handleBuyDirect}
          disabled={!isAvailable}
        >
          {isInCart ? '✓ Added to Cart' : isAvailable ? 'Buy Direct' : 'Not Available'}
        </button>
      </div>
    </div>
  )
}

export default AnimalCard
