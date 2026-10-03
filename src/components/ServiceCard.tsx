import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Service } from '../data/services'
import { rateLabel } from '../lib/pricing'

export function Rate({ service }: { service: Service }) {
  const r = rateLabel(service)
  return (
    <span className="rate">
      {r.prefix && <small>{r.prefix}</small>}
      <strong>{r.amount}</strong>
      <small>{r.unit}</small>
    </span>
  )
}

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon
  return (
    <article className="service-card">
      {service.popular && <span className="badge">Most popular</span>}
      <div className="service-card__icon">
        <Icon size={26} />
      </div>
      <h3>{service.name}</h3>
      <p>{service.short}</p>
      <div className="service-card__footer">
        <Rate service={service} />
        <Link to={`/book?service=${service.id}`} className="btn btn--soft btn--sm">
          Book <ArrowRight size={16} />
        </Link>
      </div>
      <Link to={`/services#${service.id}`} className="service-card__more">
        What's included
      </Link>
    </article>
  )
}
