import FarmerPortalSection from '../components/FarmerPortalSection'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const FarmerPortalPage = () => {
  return (
    <div className="wireframe-page">
      <div style={{ paddingTop: '2rem' }}>
        <div className="wireframe-farmer-section__header" style={{ maxWidth: '1200px', margin: '0 auto 1.25rem', padding: '0 1.5rem' }}>
          <div>
            <span className="wireframe-tag-badge">// SELLER WORKSPACE</span>
            <h1 className="wireframe-farmer-section__title">Manage your farm listings</h1>
          </div>
          <Link to="/farmer-portal/add-animal" className="wireframe-btn-sm wireframe-btn-sm--green">
            + Add Animal
          </Link>
        </div>
        <FarmerPortalSection />
      </div>
      <Footer />
    </div>
  )
}

export default FarmerPortalPage
