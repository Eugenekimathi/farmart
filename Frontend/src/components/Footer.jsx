import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <h3 className="footer__logo">Farmart Kenya</h3>
          <p className="footer__tagline">
            Soko la Wakulima — directly connecting Kenyan livestock farmers with verified buyers. Zero middleman margins.
          </p>
        </div>

        <div className="footer__links">
          <h4 className="footer__links-title">Shop</h4>
          <ul className="footer__list">
            <li><Link to="/store" className="footer__link">Livestock</Link></li>
            <li><Link to="/store" className="footer__link">Categories</Link></li>
            <li><Link to="/store" className="footer__link">Featured</Link></li>
          </ul>
        </div>

        <div className="footer__links">
          <h4 className="footer__links-title">For Farmers</h4>
          <ul className="footer__list">
            <li><Link to="/farmer-portal" className="footer__link">Farmer Portal</Link></li>
            <li><Link to="/farmer-portal/add-animal" className="footer__link">Add Animal</Link></li>
          </ul>
        </div>

        <div className="footer__links">
          <h4 className="footer__links-title">Company</h4>
          <ul className="footer__list">
            <li><Link to="/" className="footer__link">About</Link></li>
            <li><Link to="/" className="footer__link">How It Works</Link></li>
            <li><Link to="/" className="footer__link">Contact</Link></li>
          </ul>
        </div>

        <div className="footer__links">
          <h4 className="footer__links-title">Support</h4>
          <ul className="footer__list">
            <li><Link to="/" className="footer__link">Help</Link></li>
            <li><Link to="/" className="footer__link">FAQs</Link></li>
            <li><Link to="/" className="footer__link">Terms</Link></li>
            <li><Link to="/" className="footer__link">Privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <span>Farmart Kenya</span>
        <span>All rights reserved</span>
        <span>Copyright 2026</span>
      </div>
    </footer>
  )
}

export default Footer
