import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section not-found">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1>This page has been cleaned away.</h1>
        <p className="lead">We couldn’t find what you were looking for.</p>
        <div className="not-found__actions">
          <Link to="/" className="btn btn--primary">
            Back to home
          </Link>
          <Link to="/book" className="btn btn--ghost">
            Book a clean
          </Link>
        </div>
      </div>
    </section>
  )
}
