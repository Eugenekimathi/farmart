import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem, syncAddToCart } from '../features/cart/cartSlice'

const FALLBACK_IMAGES = {
  cattle: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80',
  sheep: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=600&q=80',
  goat: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&w=600&q=80',
}

const AnimalCard = ({ animal }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items } = useSelector((state) => state.cart)
  const isInCart = items.some((item) => item.id === animal.id)

  const primaryImage =
    animal.images?.find((img) => img.is_primary) || animal.images?.[0]
  const animalType = animal.animal_type?.name?.toLowerCase()
  const fallbackImage = FALLBACK_IMAGES[animalType] || FALLBACK_IMAGES.cattle
  const imageUrl = primaryImage?.image_url || fallbackImage

  const handleBuyDirect = (e) => {
    e.stopPropagation()
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
    <div className="wireframe-card" onClick={handleCardClick}>
      <div className="wireframe-card__image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={animal.name}
            className="wireframe-card__image"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = fallbackImage
            }}
          />
        ) : (
          <div className="wireframe-card__placeholder">🐄 Livestock Photo</div>
        )}
      </div>

      <div className="wireframe-card__body">
        <h3 className="wireframe-card__title">{animal.name}</h3>

        <div className="wireframe-card__meta">
          <span className="wireframe-card__location">📍 {locationText}</span>
          <span className="wireframe-card__weight">⚖️ {weightText}</span>
        </div>

        <div className="wireframe-card__price">{formattedPrice}</div>

        <div className="wireframe-card__savings-badge">
          {formattedSavings}
        </div>

        <button
          className={`wireframe-btn-buy ${isInCart ? 'wireframe-btn-buy--added' : ''}`}
          onClick={handleBuyDirect}
        >
          {isInCart ? '✓ Added to Cart' : 'Buy Direct'}
        </button>
      </div>
    </div>
  )
}

export default AnimalCard
