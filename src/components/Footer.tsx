import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { business } from '../data/config'
import { services } from '../data/services'
import Logo from './Logo'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p>{business.tagline} Professional cleaning, sofa & carpet shampooing and pest control for homes and offices in {business.city}, {business.state}.</p>
          <Link to="/book" className="btn btn--primary">
            Book a clean
          </Link>
        </div>

        <div>
          <h4>Services</h4>
          <ul>
            {services.map((s) => (
              <li key={s.id}>
                <Link to={`/book?service=${s.id}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><Link to="/services">All services</Link></li>
            <li><Link to="/#plans">Care Plans</Link></li>
            <li><Link to="/#how-it-works">How it works</Link></li>
            <li><Link to="/#pricing">Pricing</Link></li>
            <li><Link to="/#faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer__contact">
            <li>
              <Phone size={16} />
              <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a>
            </li>
            <li>
              <Mail size={16} />
              <a href={`mailto:${business.email}`}>{business.email}</a>
            </li>
            <li>
              <Clock size={16} /> {business.hours}
            </li>
            <li>
              <MapPin size={16} /> {business.serviceArea}
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {year} {business.name}. All rights reserved.</span>
        <span>Verified professionals · Safe, approved products</span>
      </div>
    </footer>
  )
}
