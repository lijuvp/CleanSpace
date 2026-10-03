import { ArrowRight, Check, Repeat, Ruler, Search, TrendingDown, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bubbles, SprayBottle } from '../components/Graphics'
import { PlanBanner } from '../components/Plans'
import { Rate } from '../components/ServiceCard'
import { categories, extras, services } from '../data/services'
import { formatMoney } from '../lib/format'

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <Bubbles items={[['4%', '18%', 20], ['62%', '10%', 14, 1], ['74%', '62%', 30, 2], ['95%', '30%', 22, 0.6]]} />
        <SprayBottle className="page-hero__bottle" />
        <div className="container">
          <span className="eyebrow">Services & rates</span>
          <h1>Everything we do, and what’s included</h1>
          <p className="lead">
            Clear checklists and transparent rates. Pick a service to see your exact price in the
            booking flow.
          </p>
          <nav className="jump-links" aria-label="Jump to service">
            {services.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                <s.icon size={16} /> {s.name}
              </a>
            ))}
          </nav>
          <PlanBanner />
        </div>
      </section>

      <section className="section section--tight">
        <div className="container service-list">
          {services.map((s) => (
            <article key={s.id} id={s.id} className="service-detail">
              <div className="service-detail__main">
                <div className="service-detail__title">
                  <div className="service-card__icon">
                    <s.icon size={26} />
                  </div>
                  <div>
                    <span className="muted small">
                      {categories.find((c) => c.id === s.category)!.label}
                    </span>
                    <h2>{s.name}</h2>
                  </div>
                  {s.popular && <span className="badge badge--inline">Most popular</span>}
                </div>
                <p>{s.description}</p>
                <ul className="checklist">
                  {s.includes.map((item) => (
                    <li key={item}>
                      <Check size={18} /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="service-detail__side">
                <span className="muted small">Rate</span>
                <div className="service-detail__price">
                  <Rate service={s} />
                </div>
                <ul className="meta-list">
                  <li>
                    <Users size={16} /> {s.idealFor}
                  </li>
                  <li>
                    <Ruler size={16} /> {s.unit === 'seat' ? 'Priced per seat' : 'Priced per sq.ft of area'}
                  </li>
                  {s.tiers && (
                    <li>
                      <TrendingDown size={16} /> Lower rate for larger areas
                    </li>
                  )}
                  {s.fromPrice && (
                    <li>
                      <Search size={16} /> Final price after free inspection
                    </li>
                  )}
                  {s.recurring && (
                    <li>
                      <Repeat size={16} /> Recurring plans save up to 20%
                    </li>
                  )}
                </ul>
                <Link to={`/book?service=${s.id}`} className="btn btn--primary btn--block">
                  Book now <ArrowRight size={18} />
                </Link>
              </aside>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tint">
        <div className="container">
          <div className="section__head">
            <span className="eyebrow">Add-ons</span>
            <h2>Make it extra fresh</h2>
            <p>Add any of these to a cleaning booking in one tap.</p>
          </div>
          <div className="extras-grid">
            {extras.map((e) => (
              <div key={e.id} className="extra-tile">
                <e.icon size={24} />
                <strong>{e.name}</strong>
                <span>+{formatMoney(e.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
