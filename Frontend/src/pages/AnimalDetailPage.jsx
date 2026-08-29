import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getAnimalById } from '../features/animals/animalsSlice'
import { addItem, syncAddToCart } from '../features/cart/cartSlice'
import '../styles/animalDetail.css'

const AnimalDetailPage = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { selectedAnimal, isLoading, error } = useSelector(
    (state) => state.animals
  )
  const { user, role } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)

  const isInCart = items.some((item) => item.id === selectedAnimal?.id)
  const isAvailable = selectedAnimal?.status?.toUpperCase() === 'AVAILABLE'

  useEffect(() => {
    dispatch(getAnimalById(id))
  }, [dispatch, id])

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    dispatch(addItem(selectedAnimal))
    dispatch(syncAddToCart(selectedAnimal.id))
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login')
      return
    }
    dispatch(addItem(selectedAnimal))
    dispatch(syncAddToCart(selectedAnimal.id))
    navigate('/cart')
  }

  // Get primary image
  const primaryImage =
    selectedAnimal?.images?.find((img) => img.is_primary) ||
    selectedAnimal?.images?.[0]

  // Other images for thumbnails
  const otherImages = selectedAnimal?.images?.filter(
    (img) => img.id !== primaryImage?.id
  )

  const formattedPrice = selectedAnimal
    ? `KSh ${Number(selectedAnimal.price).toLocaleString()}`
    : ''

  const savings = selectedAnimal
    ? Math.round(selectedAnimal.price * 0.2)
    : 0

  // Loading state
  if (isLoading) {
    return (
      <div className="detail-loading">
        <div className="spinner" />
        <p>Loading animal details...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="detail-error">
        <p>⚠️ {error}</p>
        <button
          className="btn btn--primary"
          onClick={() => navigate('/store')}
        >
          Back to Store
        </button>
      </div>
    )
  }

  if (!selectedAnimal) return null

  return (
    <div className="detail-page">

      {/* Breadcrumb */}
      <div className="detail-page__breadcrumb">
        <span
          className="detail-page__breadcrumb-link"
          onClick={() => navigate('/store')}
        >
          Store
        </span>
        <span> / </span>
        <span>{selectedAnimal.name}</span>
      </div>

      <div className="detail-page__body">

        {/* Left — Image gallery */}
        <div className="detail-gallery">

          {/* Primary image */}
          <div className="detail-gallery__main">
            {primaryImage ? (
              <img
                src={primaryImage.image_url}
                alt={selectedAnimal.name}
                className="detail-gallery__main-img"
                onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.svg' }}
              />
            ) : (
              <img src="/placeholder.svg" alt="placeholder" className="detail-gallery__main-img" />
            )}
          </div>

          {/* Thumbnails */}
          {otherImages?.length > 0 && (
            <div className="detail-gallery__thumbs">
              {otherImages.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={selectedAnimal.name}
                  className="detail-gallery__thumb"
                />
              ))}
            </div>
          )}

        </div>

        {/* Right — Info panel */}
        <div className="detail-info">

          {/* Name and status */}
          <div className="detail-info__top">
            <h1 className="detail-info__name">{selectedAnimal.name}</h1>
            <span className={`detail-info__status detail-info__status--${selectedAnimal.status}`}>
              {selectedAnimal.status}
            </span>
          </div>

          {/* Type and breed */}
          <div className="detail-info__tags">
            {selectedAnimal.animal_type?.name && (
              <span className="detail-tag">{selectedAnimal.animal_type.name}</span>
            )}
            {selectedAnimal.breed?.name && (
              <span className="detail-tag">{selectedAnimal.breed.name}</span>
            )}
          </div>

          {/* Quick stats grid */}
          <div className="detail-stats">
            <div className="detail-stat">
              <span className="detail-stat__label">Gender</span>
              <span className="detail-stat__value">
                {selectedAnimal.gender === 'male' ? '♂ Male' : '♀ Female'}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Age</span>
              <span className="detail-stat__value">{selectedAnimal.age} months</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Location</span>
              <span className="detail-stat__value">📍 {selectedAnimal.location}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Listed by</span>
              <span className="detail-stat__value">
                🌾 {selectedAnimal.farmer?.farm_name || 'Verified Farmer'}
              </span>
            </div>
          </div>

          {/* Description */}
          {selectedAnimal.description && (
            <div className="detail-info__desc">
              <h3 className="detail-info__desc-title">About this animal</h3>
              <p className="detail-info__desc-text">{selectedAnimal.description}</p>
            </div>
          )}

          {/* Price block */}
          <div className="detail-price-block">
            <p className="detail-price-block__price">{formattedPrice}</p>
            <p className="detail-price-block__savings">
              💚 Save KSh {savings.toLocaleString()} — No Broker Cut!
            </p>
          </div>

          {/* Action buttons — only for buyers */}
          {role !== 'farmer' && (
            <div className="detail-actions">
              <button
                className="btn btn--primary btn--full"
                onClick={handleBuyNow}
                disabled={!isAvailable}
              >
                {!isAvailable
                  ? 'Not Available'
                  : 'Buy Direct'}
              </button>

              <button
                className={`btn btn--outline btn--full ${isInCart ? 'btn--in-cart' : ''}`}
                onClick={handleAddToCart}
                disabled={
                  isInCart || !isAvailable
                }
              >
                {isInCart ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            </div>
          )}

          {/* Farmer can't buy their own listing */}
          {role === 'farmer' && (
            <div className="detail-farmer-note">
              <p>You are viewing this as a farmer. Switch to a buyer account to purchase.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default AnimalDetailPage

