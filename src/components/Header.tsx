import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { business } from '../data/config'
import Logo from './Logo'

const links = [
  { to: '/services', label: 'Services' },
  { to: '/#how-it-works', label: 'How it works' },
  { to: '/#pricing', label: 'Pricing' },
  { to: '/#faq', label: 'FAQ' },
]

export default function Header({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const tel = `tel:${business.phone.replace(/[^+\d]/g, '')}`

  if (minimal) {
    return (
      <header className="header header--scrolled">
        <div className="container header__inner">
          <Logo />
          <a className="header__help" href={tel}>
            <Phone size={16} />
            <span>
              Need help? <strong>{business.phone}</strong>
            </span>
          </a>
        </div>
      </header>
    )
  }

  return (
    <header className={`header ${scrolled || open ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <Logo />

        <nav
          className={`nav ${open ? 'nav--open' : ''}`}
          aria-label="Main"
          onClick={() => setOpen(false)}
        >
          {links.map((l) =>
            l.to.includes('#') ? (
              <Link key={l.to} to={l.to} className="nav__link">
                {l.label}
              </Link>
            ) : (
              <NavLink key={l.to} to={l.to} className="nav__link">
                {l.label}
              </NavLink>
            ),
          )}
          <a className="nav__link nav__phone" href={tel}>
            <Phone size={16} /> {business.phone}
          </a>
          <Link to="/book" className="btn btn--primary nav__cta">
            Book a clean
          </Link>
        </nav>

        <button
          className="header__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
