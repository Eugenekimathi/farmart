import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getAnimalById } from '../features/animals/animalsSlice'
import { addItem, syncAddToCart } from '../features/cart/cartSlice'
import '../styles/animalDetail.css'

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

const StarIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MessageIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const UserIcon = () => (
  <svg className="icon icon--sm" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ImageIcon = () => (
  <svg className="icon icon--lg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
)

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
        <span className="detail-page__breadcrumb-sep">/</span>
        <span className="detail-page__breadcrumb-current">{selectedAnimal.name}</span>
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
              <div className="detail-gallery__placeholder">
                <ImageIcon />
              </div>
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
                {selectedAnimal.gender === 'male' ? 'Male' : 'Female'}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Age</span>
              <span className="detail-stat__value">{selectedAnimal.age} months</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Location</span>
              <span className="detail-stat__value">{selectedAnimal.location}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat__label">Listed by</span>
              <span className="detail-stat__value">
                {selectedAnimal.farmer?.farm_name || 'Verified Farmer'}
              </span>
            </div>
          </div>

          <div className="detail-trust-badges">
            <span className="detail-trust-badge">
              <ShieldCheckIcon />
              Health checked
            </span>
            <span className="detail-trust-badge">
              <ShieldCheckIcon />
              Verified farmer
            </span>
            <span className="detail-trust-badge">
              <ShieldCheckIcon />
              Direct delivery
            </span>
          </div>

          {/* Tabs */}
          <div className="detail-tabs">
            <button className="detail-tab detail-tab--active">Details</button>
            <button className="detail-tab">Seller</button>
            <button className="detail-tab">Delivery</button>
            <button className="detail-tab">Reviews</button>
          </div>

          {/* Description */}
          {selectedAnimal.description && (
            <div className="detail-info__desc">
              <h3 className="detail-info__desc-title">About this animal</h3>
              <p className="detail-info__desc-text">{selectedAnimal.description}</p>
            </div>
          )}

          {/* Farmer card */}
          <div className="detail-farmer-card">
            <div className="detail-farmer-avatar">
              <UserIcon />
            </div>
            <div className="detail-farmer-info">
              <div className="detail-farmer-name">{selectedAnimal.farmer?.farm_name || 'Verified Farmer'}</div>
              <div className="detail-farmer-verified">
                <ShieldCheckIcon />
                Verified Farmer
              </div>
              <div className="detail-farmer-meta">{selectedAnimal.location}</div>
              <div className="detail-farmer-rating">
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <StarIcon />
                <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                  5.0 (12 sales)
                </span>
              </div>
            </div>
          </div>

          <div className="detail-farmer-actions">
            <button className="detail-farmer-action-btn">
              <PhoneIcon />
              Call Farmer
            </button>
            <button className="detail-farmer-action-btn detail-farmer-action-btn--whatsapp">
              <MessageIcon />
              WhatsApp
            </button>
          </div>

          {/* Price block */}
          <div className="detail-price-block">
            <p className="detail-price-block__price">{formattedPrice}</p>
            <p className="detail-price-block__note">
              Direct from farmer. No broker markup.
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
                {isInCart ? 'Added to Cart' : 'Add to Cart'}
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
