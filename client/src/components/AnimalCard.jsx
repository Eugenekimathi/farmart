import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../features/cart/cartSlice'

const AnimalCard = ({ animal }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, role } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const isInCart = items.some((item) => item.id === animal.id)

  const primaryImage = animal.images?.find((img) => img.is_primary) || animal.images?.[0]

  const handleBuyDirect = (e) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    dispatch(addItem(animal))
  }

  const handleCardClick = () => {
    navigate(`/store/${animal.id}`)
  }

  const formattedPrice = `KSh ${Number(animal.price).toLocaleString()}`
  const savings = Math.round(animal.price * 0.2)
  const formattedSavings = `Save KSh ${savings.toLocaleString()} — No Broker Cut!`

  return (
    <div className="animal-card" onClick={handleCardClick}>
      <div className="animal-card__image-wrap">
        {primaryImage ? (
          <img
            src={primaryImage.image_url}
            alt={animal.name}
            className="animal-card__image"
            onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }}
          />
        ) : (
          <img src="/placeholder.svg" alt="placeholder" className="animal-card__image" />
        )}
      </div>

      <div className="animal-card__body">
        <h3 className="animal-card__name">{animal.name}</h3>

        <div className="animal-card__meta">
          <span className="animal-card__location">📍 {animal.location}</span>
          <span className="animal-card__weight">⚖️ {animal.age} mo</span>
        </div>

        <p className="animal-card__price">{formattedPrice}</p>

        <p className="animal-card__savings">{formattedSavings}</p>

        {role !== 'farmer' && (
          <button className={`btn ${isInCart ? 'btn--outline' : 'btn--primary'} btn--full`} onClick={handleBuyDirect}>
            {isInCart ? '✓ Added to Cart' : 'Buy Direct (M-Pesa)'}
          </button>
        )}
      </div>
    </div>
  )
}

export default AnimalCard
