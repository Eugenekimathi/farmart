import heroImage from '../assets/Images/pure-sahiwal-cow-649.jpg'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import Footer from '../components/Footer'
import AnimalCard from '../components/AnimalCard'
import { getAnimals, getAnimalTypes } from '../features/animals/animalsSlice'
import '../styles/home.css'

const categoryVisuals = {
  cattle: '🐄',
  goat: '🐐',
  goats: '🐐',
  sheep: '🐑',
  poultry: '🐔',
  chicken: '🐔',
  rabbit: '🐇',
  rabbits: '🐇',
  pig: '🐖',
  pigs: '🐖',
  other: '🐾',
}

const counties = [
  { name: 'Nairobi' },
  { name: 'Nakuru' },
  { name: 'Kiambu' },
  { name: 'Machakos' },
  { name: 'Kisumu' },
  { name: 'Mombasa' },
]

const features = [
  {
    title: 'No Middlemen',
    desc: 'Buy directly from verified farmers. Zero broker fees, zero hidden charges.',
  },
  {
    title: 'Pay via M-Pesa',
    desc: 'Instant mobile payments directly to the farmer. Safe, fast, and reliable.',
  },
  {
    title: 'Verified Listings',
    desc: 'Every farmer and animal listing is verified before going live on the platform.',
  },
  {
    title: 'Search & Filter',
    desc: 'Find exactly what you need by animal type, breed, age, and location.',
  },
  {
    title: 'For Farmers',
    desc: 'List your animals for free. Reach buyers across Kenya without leaving your farm.',
  },
  {
    title: 'Direct Delivery',
    desc: 'Arrange delivery directly with the farmer. No third-party logistics markup.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Create an Account',
    desc: 'Register as a buyer or farmer in under a minute.',
  },
  {
    step: '02',
    title: 'Browse Listings',
    desc: 'Search and filter livestock by type, breed, age, and location.',
  },
  {
    step: '03',
    title: 'Add to Cart',
    desc: 'Select the animals you want and add them to your cart.',
  },
  {
    step: '04',
    title: 'Pay via M-Pesa',
    desc: 'Complete payment directly to the farmer via M-Pesa STK push.',
  },
]

const HomePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, role } = useSelector((state) => state.auth)
  const { animals, animalTypes } = useSelector((state) => state.animals)

  // Keep homepage categories aligned with the same backend records used by forms and filters.
  useEffect(() => {
    dispatch(getAnimals({ page: 1 }))
    dispatch(getAnimalTypes())
  }, [dispatch])

  const categories = animalTypes.length > 0
    ? animalTypes.map((type) => ({
      id: type.id,
      name: type.name,
      visual: categoryVisuals[type.name.toLowerCase()] || categoryVisuals.other,
    }))
    : [{ id: 'all', name: 'All Livestock', visual: categoryVisuals.other }]

  const handleCTA = () => {
    if (user && role === 'farmer') {
      navigate('/farmer-portal')
    } else {
      navigate('/store')
    }
  }

  const featuredAnimals = animals.slice(0, 8)

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Direct from verified Kenyan farmers
          </p>
          <h1 className="hero__title">
            Nunua Mifugo Moja Kwa Moja <br />
            <span className="hero__title-highlight">
              Kutoka Kwa Wakulima
            </span>
          </h1>
          <p className="hero__subtitle">
            Where buyers meet sellers without the need for brokers.
            Buy directly from verified Kenyan farmers.
          </p>

          <div className="hero__actions">
            <button
              className="btn btn--primary btn--lg"
              onClick={handleCTA}
            >
              {user && role === 'farmer'
                ? 'Go to Farmer Portal'
                : 'Browse Livestock'}
            </button>

            {!user && (
              <button
                className="btn btn--outline btn--lg"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </button>
            )}
          </div>

          {/* Trust bar */}
          <div className="hero__trust">
            <span className="hero__trust-item">✓ Verified farmers</span>
            <span className="hero__trust-divider">|</span>
            <span className="hero__trust-item">✓ No broker fees</span>
            <span className="hero__trust-divider">|</span>
            <span className="hero__trust-item">✓ M-Pesa payments</span>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero__visual">
          <img className="hero__visual-img" src={heroImage} alt="Kenyan livestock farm" />
        </div>
      </section>

      {/* Shop by Category */}
      <section className="shop-category">
        <div className="shop-category__inner">
          <div className="section-header">
            <span className="section-header__tag">Browse by Category</span>
            <h2 className="section-header__title">Shop by Animal Type</h2>
            <p className="section-header__sub">
              Find the perfect livestock for your farm from our wide selection
            </p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={cat.id === 'all' ? '/store' : `/store?type=${cat.id}`}
                className="category-card"
              >
                <span className="category-card__icon" aria-hidden="true">{cat.visual}</span>
                <div className="category-card__name">{cat.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Animals */}
      <section className="featured-animals">
        <div className="featured-animals__inner">
          <div className="section-header">
            <span className="section-header__tag">Featured Listings</span>
            <h2 className="section-header__title">Featured Animals</h2>
            <p className="section-header__sub">
              Top-quality livestock from verified farmers across Kenya
            </p>
          </div>

          <div className="featured-animals__grid">
            {featuredAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              className="btn btn--outline btn--lg"
              onClick={() => navigate('/store')}
            >
              View All Livestock
            </button>
          </div>
        </div>
      </section>

      {/* County Discovery */}
      <section className="county-discovery">
        <div className="county-discovery__inner">
          <div className="county-discovery__header">
            <h2 className="county-discovery__title">Find Animals Near You</h2>
            <p className="county-discovery__sub">
              Browse livestock by county and connect with local farmers
            </p>
          </div>

          <div className="county-grid">
            {counties.map((county) => (
              <a
                key={county.name}
                href={`/store?county=${county.name}`}
                className="county-card"
              >
                <div className="county-card__name">{county.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-it-works__inner">
          <div className="section-header">
            <span className="section-header__tag">Simple Process</span>
            <h2 className="section-header__title">How Farmart Works</h2>
            <p className="section-header__sub">
              From browsing to buying in just 4 simple steps
            </p>
          </div>

          <div className="steps">
            {steps.map((s, index) => (
              <div key={s.step} className="step">
                <div className="step__number">{s.step}</div>
                {index < steps.length - 1 && (
                  <div className="step__connector" />
                )}
                <h3 className="step__title">{s.title}</h3>
                <p className="step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="features__inner">
          <div className="section-header">
            <span className="section-header__tag">Why Farmart?</span>
            <h2 className="section-header__title">
              A better way to buy and sell livestock
            </h2>
            <p className="section-header__sub">
              We cut out the middlemen so farmers earn more and
              buyers pay less.
            </p>
          </div>

          <div className="features__grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2 className="cta-banner__title">
            Ready to buy or sell livestock?
          </h2>
          <p className="cta-banner__sub">
            Buy directly from verified Kenyan farmers. Browse livestock by type, breed, age and location.
          </p>
          <div className="cta-banner__actions">
            <button
              className="btn btn--white btn--lg"
              onClick={() => navigate('/store')}
            >
              Browse Store
            </button>
            {!user && (
              <button
                className="btn btn--outline-white btn--lg"
                onClick={() => navigate('/register')}
              >
                Register as Farmer
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  )
}

export default HomePage
