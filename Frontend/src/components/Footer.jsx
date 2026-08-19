import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="wireframe-footer">
      <div className="wireframe-footer__container">
        <div className="wireframe-footer__col wireframe-footer__col--brand">
          <h3 className="wireframe-footer__logo">Farmart Kenya</h3>
          <p className="wireframe-footer__desc">
            Soko la Wakulima — directly connecting Kenyan livestock farmers with verified buyers. Zero middleman margins.
          </p>
        </div>

        <div className="wireframe-footer__col wireframe-footer__col--center">
          <p className="wireframe-footer__copy">All rights reserved .</p>
          <div className="wireframe-footer__page-badge">1/1</div>
        </div>

        <div className="wireframe-footer__col wireframe-footer__col--links">
          <h4 className="wireframe-footer__heading">// LINKS</h4>
          <ul className="wireframe-footer__list">
            <li><Link to="/store">Store</Link></li>
            <li><Link to="/farmer-portal">Farmer Portal</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><a href="#about" onClick={(e) => e.preventDefault()}>About Project</a></li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer
