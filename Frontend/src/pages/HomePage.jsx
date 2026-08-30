import heroImage from '../assets/Images/pure-sahiwal-cow-649.jpg'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import '../styles/home.css'

const features = [
  {
    icon: 'N',
    title: 'No Middlemen',
    desc: 'Buy directly from verified farmers. Zero broker fees, zero hidden charges.',
  },
  {
    icon: 'M',
    title: 'Pay via M-Pesa',
    desc: 'Instant mobile payments directly to the farmer. Safe, fast, and reliable.',
  },
  {
    icon: 'V',
    title: 'Verified Listings',
    desc: 'Every farmer and animal listing is verified before going live on the platform.',
  },
  {
    icon: 'S',
    title: 'Search & Filter',
    desc: 'Find exactly what you need by animal type, breed, age, and location.',
  },
  {
    icon: 'F',
    title: 'For Farmers',
    desc: 'List your animals for free. Reach buyers across Kenya without leaving your farm.',
  },
  {
    icon: 'D',
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
    desc: 'Search and filter thousands of verified livestock listings.',
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
  const { user, role } = useSelector((state) => state.auth)

  const handleCTA = () => {
    if (user && role === 'farmer') {
      navigate('/farmer-portal')
    } else {
      navigate('/store')
    }
  }

  return (
    <div className="home">

      {/*  Hero  */}
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__eyebrow"><span className="hero__eyebrow-dot" />Direct from verified Kenyan farmers</p>
          <h1 className="hero__title">
            Nunua Mifugo Moja Kwa Moja <br />
            <span className="hero__title-highlight">
              Kutoka Kwa Wakulima
            </span>
          </h1>
          <p className="hero__subtitle">
            Where buyers meet sellers without the need for brokers.
            Save up to 20% by buying directly from verified Kenyan farmers.
          </p>

          <div className="hero__actions">
            <button
              className="btn btn--primary hero__btn"
              onClick={handleCTA}
            >
              {user && role === 'farmer'
                ? 'Go to Farmer Portal'
                : 'Browse Livestock'}
            </button>

            {!user && (
              <button
                className="btn btn--outline hero__btn"
                onClick={() => navigate('/register')}
              >
                Create Free Account
              </button>
            )}
          </div>

          {/* Trust bar */}
          <div className="hero__trust">
            <span className="hero__trust-item">Verified farmers</span>
            <span className="hero__trust-divider">|</span>
            <span className="hero__trust-item">No broker fees</span>
            <span className="hero__trust-divider">|</span>
            <span className="hero__trust-item">M-Pesa payments</span>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero__visual">
          <div className="hero__visual-card">
            <img className="hero__visual-img" src={heroImage} alt="Sahiwal cattle grazing on a Kenyan farm" />
            <div className="hero__visual-price">KSh 95,000</div>
            <div className="hero__visual-name">Sahiwal Cow</div>
            <div className="hero__visual-meta">Naivasha, Nakuru County | 24 months</div>
            <div className="hero__visual-savings">
              Save KSh 19,000 | No broker cut
            </div>
            <button className="btn btn--primary" style={{ width: '100%', marginTop: '0.75rem' }} onClick={() => navigate('/store')}>
              Buy Direct (M-Pesa)
            </button>
          </div>
          <div className="hero__visual-badge">
            <span className="hero__visual-badge-label">Live listing</span>

          </div>
        </div>
      </section>


      {/*  Features  */}
      <section className="features">
        <div className="features__inner">
          <div className="section-header">
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
                <span className="feature-card__icon-wrap" aria-hidden="true">{f.title.slice(0, 1)}</span>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*  How it works  */}
      <section className="how-it-works">
        <div className="how-it-works__inner">
          <div className="section-header">
            <h2 className="section-header__title">
              From browser to farm in 4 steps
            </h2>
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

      {/*  CTA Banner  */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2 className="cta-banner__title">
            Ready to buy or sell livestock?
          </h2>
          <p className="cta-banner__sub">
            Join hundreds of Kenyan farmers and buyers already on the platform.
          </p>
          <div className="cta-banner__actions">
            <button
              className="btn btn--white"
              onClick={() => navigate('/store')}
            >
              Browse Store
            </button>
            {!user && (
              <button
                className="btn btn--outline-white"
                onClick={() => navigate('/register')}
              >
                Register as Farmer
              </button>
            )}
          </div>
        </div>
      </section>

      {/*  Footer  */}
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <span className="footer__logo">Farmart Kenya</span>
          </div>

          <div className="footer__links">
            <span className="footer__links-title">LINKS</span>
            <span
              className="footer__link"
              onClick={() => navigate('/store')}
            >
              Store
            </span>
            <span
              className="footer__link"
              onClick={() => navigate('/farmer-portal')}
            >
              Farmer Portal
            </span>
            <span
              className="footer__link"
              onClick={() => navigate('/register')}
            >
              Donors
            </span>
            <span
              className="footer__link"
              onClick={() => navigate('/')}
            >
              About Project
            </span>
          </div>
        </div>

        <div className="footer__bottom">
          <span>Farmart Kenya</span>
          <span>All rights reserved</span>
          <span>Copyright 2026</span>
        </div>
      </footer>

    </div>
  )
}

export default HomePage




