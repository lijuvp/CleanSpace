import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  Heart,
  Leaf,
  Lock,
  MousePointerClick,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Faq from '../components/Faq'
import { Bubbles, BucketMop, SparkleCluster, Sponge, SprayBottle } from '../components/Graphics'
import CarePlans, { savePercent } from '../components/Plans'
import ServiceCard, { Rate } from '../components/ServiceCard'
import SizeInput from '../components/SizeInput'
import { business } from '../data/config'
import {
  categories,
  frequencies,
  getService,
  services,
  type Category,
  type FrequencyId,
  type ServiceId,
} from '../data/services'
import { formatHours, formatMoney } from '../lib/format'
import { quote, sizingForSwitch, type Sizing } from '../lib/pricing'

const promises = [
  { icon: ShieldCheck, title: 'Verified & trained', text: 'Background-checked professionals' },
  { icon: Heart, title: 'Happiness guarantee', text: 'Not perfect? We redo it free' },
  { icon: Leaf, title: 'Safe products', text: 'Gentle on kids, pets & planet' },
  { icon: Lock, title: 'Pay after service', text: 'Nothing to pay online today' },
]

const steps = [
  {
    icon: MousePointerClick,
    title: 'Pick your service',
    text: 'Choose a service, enter your area or BHK size and see your price instantly — no site visit needed to get a quote.',
  },
  {
    icon: CalendarCheck,
    title: 'Choose a slot',
    text: 'Select a date and arrival time that suits you. We confirm your booking on call or email shortly after.',
  },
  {
    icon: Sparkles,
    title: 'Relax, we handle it',
    text: 'Our team arrives fully equipped. Get on with your day and come back to a spotless, pest-free space.',
  },
]

function ServiceSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: ServiceId
  onChange: (id: ServiceId) => void
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value as ServiceId)}>
      {categories.map((c) => (
        <optgroup key={c.id} label={c.label}>
          {services
            .filter((s) => s.category === c.id)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}

interface EstimateState {
  serviceId: ServiceId
  sizing: Sizing
  frequency: FrequencyId
}

function Estimator({
  state,
  onChange,
}: {
  state: EstimateState
  onChange: (state: EstimateState) => void
}) {
  const service = getService(state.serviceId)!
  const frequency = service.recurring ? state.frequency : 'once'
  const q = quote(service, state.sizing, [], frequency)
  const bookUrl = `/book?service=${service.id}&sqft=${state.sizing.sqft}&seats=${state.sizing.seats}&frequency=${frequency}`

  const changeService = (id: ServiceId) =>
    onChange({
      ...state,
      serviceId: id,
      sizing: sizingForSwitch(service, getService(id)!, state.sizing),
    })

  return (
    <div className="calculator" id="estimate">
      <div className="calculator__head">
        <h2>Instant estimate</h2>
        <Rate service={service} />
      </div>
      <label className="field">
        <span>What do you need?</span>
        <ServiceSelect id="calc-service" value={service.id} onChange={changeService} />
      </label>
      <SizeInput
        service={service}
        sizing={state.sizing}
        onChange={(sizing) => onChange({ ...state, sizing })}
      />
      {service.recurring && (
        <div className="chips" role="radiogroup" aria-label="Frequency">
          {frequencies.map((f) => (
            <button
              key={f.id}
              role="radio"
              aria-checked={state.frequency === f.id}
              className={`chip ${state.frequency === f.id ? 'chip--active' : ''}`}
              onClick={() => onChange({ ...state, frequency: f.id })}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
      <div className="calculator__total">
        <div>
          <small>{q.estimateOnly ? 'Estimated from' : 'Estimated total'}</small>
          <strong>{formatMoney(q.total)}</strong>
          {q.discount > 0 && <s>{formatMoney(q.subtotal)}</s>}
        </div>
        <span className="muted small">
          ≈ {formatHours(q.hours)}
          {q.team > 1 ? ` · team of ${q.team}` : ''}
        </span>
      </div>
      <Link to={bookUrl} className="btn btn--primary btn--block btn--lg">
        Book now <ArrowRight size={18} />
      </Link>
      <p className="calculator__note">
        {service.recurring ? (
          <Link to="/#plans">Need regular cleaning? Save more with a Care Plan →</Link>
        ) : (
          'No payment today · Free cancellation up to 24h'
        )}
      </p>
    </div>
  )
}

function Hero({ estimate }: { estimate: ReactNode }) {
  return (
    <section className="hero">
      <div className="hero__bg" aria-hidden="true">
        <Bubbles
          items={[
            ['3%', '14%', 26],
            ['8%', '78%', 54, 1],
            ['30%', '4%', 14, 2],
            ['36%', '88%', 22, 0.5],
            ['47%', '20%', 16, 1.5],
            ['52%', '74%', 36, 2.5],
            ['94%', '64%', 38, 0.8],
            ['97%', '22%', 18, 1.8],
          ]}
        />
      </div>
      <div className="container hero__grid">
        <div className="hero__copy">
          <span className="eyebrow">
            <Sparkles size={16} /> Cleaning & pest control in {business.city}
          </span>
          <h1>
            A spotless space, <span className="text-gradient">booked in 60 seconds.</span>
            <SparkleCluster />
          </h1>
          <p className="lead">
            Deep cleaning, sofa & carpet shampooing and pest control for homes and offices across{' '}
            {business.city}. Transparent per-sq.ft pricing, trained professionals and a redo
            guarantee on every visit.
          </p>
          <ul className="hero__points">
            <li><CircleCheck size={18} /> See your exact price before you book</li>
            <li><CircleCheck size={18} /> Verified, trained professionals</li>
            <li><CircleCheck size={18} /> Pay after the service — nothing online today</li>
          </ul>
          <div className="hero__actions">
            <Link to="/services" className="btn btn--ghost">
              Browse services
            </Link>
            <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`} className="btn btn--ghost">
              <Phone size={18} /> {business.phone}
            </a>
          </div>
          <Link to="/#plans" className="hero__promo">
            <span className="hero__promo-tag">New</span>
            <span>
              <strong>Care Plans</strong> — monthly cleaning &amp; pest control, save up to {savePercent}
            </span>
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="hero__visual">
          <Sponge className="hero__sponge" />
          {estimate}
          <SprayBottle className="hero__bottle" />
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  const [filter, setFilter] = useState<'all' | Category>('all')
  const shown = services.filter((s) => filter === 'all' || s.category === filter)

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow">Our services</span>
          <h2>Everything your space needs</h2>
          <p>From an Onam deep clean to monsoon termite protection — pick what you need.</p>
          <div className="segmented segmented--center segmented--wrap" role="tablist" aria-label="Filter services">
            {[{ id: 'all' as const, label: 'All' }, ...categories].map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={filter === c.id}
                className={filter === c.id ? 'active' : ''}
                onClick={() => setFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card-grid">
          {shown.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="section section--tint" id="how-it-works">
      <div className="container">
        <div className="section__head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps to a cleaner space</h2>
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step__num">{i + 1}</span>
              <div className="step__icon">
                <s.icon size={28} />
              </div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Pricing({
  selected,
  onSelect,
}: {
  selected: ServiceId
  onSelect: (id: ServiceId) => void
}) {
  return (
    <section className="section" id="pricing">
      <div className="container pricing">
        <div className="pricing__copy">
          <span className="eyebrow">Transparent pricing</span>
          <h2>Simple rates. No surprises.</h2>
          <p>
            Most services are priced per square foot of the area we work on; sofa shampooing is per
            seat. Need us regularly? <Link to="/#plans">Care Plans</Link> save up to {savePercent}.
          </p>
          <p className="muted small">
            Tap any service to get an instant estimate. “From” prices are confirmed after a free
            on-site inspection. Taxes as applicable.
          </p>
        </div>
        <ul className="rate-card">
          {services.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={s.id === selected ? 'is-active' : ''}
                onClick={() => onSelect(s.id)}
              >
                <span>
                  <s.icon size={18} /> {s.name}
                </span>
                <Rate service={s} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  const [estimate, setEstimate] = useState<EstimateState>({
    serviceId: 'deep',
    sizing: { sqft: 1000, seats: 5 },
    frequency: 'biweekly',
  })

  const pickFromRateCard = (id: ServiceId) => {
    const current = getService(estimate.serviceId)!
    setEstimate({
      ...estimate,
      serviceId: id,
      sizing: sizingForSwitch(current, getService(id)!, estimate.sizing),
    })
    document.getElementById('estimate')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      <Hero estimate={<Estimator state={estimate} onChange={setEstimate} />} />

      <section className="promises">
        <div className="container promises__grid">
          {promises.map((p) => (
            <div key={p.title} className="promise">
              <p.icon size={24} />
              <div>
                <strong>{p.title}</strong>
                <span>{p.text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <CarePlans />
      <ServicesSection />
      <HowItWorks />
      <Pricing selected={estimate.serviceId} onSelect={pickFromRateCard} />

      <section className="section section--tint" id="faq">
        <div className="container faq-wrap">
          <div className="section__head section__head--left">
            <span className="eyebrow">FAQ</span>
            <h2>Questions? We’ve got answers.</h2>
            <p>
              Can’t find what you’re looking for? Call us on{' '}
              <a href={`tel:${business.phone.replace(/[^+\d]/g, '')}`}>{business.phone}</a> or email{' '}
              <a href={`mailto:${business.email}`}>{business.email}</a>.
            </p>
          </div>
          <Faq />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta">
            <div className="cta__copy">
              <h2>Ready for a cleaner space?</h2>
              <p>Book online in under a minute. No payment needed today.</p>
              <Link to="/book" className="btn btn--white btn--lg">
                Book now <ArrowRight size={18} />
              </Link>
            </div>
            <BucketMop className="cta__art" />
          </div>
        </div>
      </section>
    </>
  )
}
