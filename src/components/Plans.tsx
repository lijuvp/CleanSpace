import { ArrowRight, CalendarCheck, Check, CirclePause, Repeat, Users, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { maxPlanDiscount, plans, type Plan } from '../data/plans'
import { bhkPresets } from '../data/services'
import { formatMoney, formatNumber } from '../lib/format'
import { planQuote } from '../lib/pricing'
import { Bubbles, Sparkle } from './Graphics'

export const savePercent = `${Math.round(maxPlanDiscount * 100)}%`

function PlanCard({ plan, sqft }: { plan: Plan; sqft: number }) {
  const pq = planQuote(plan, sqft)
  return (
    <article className={`plan ${plan.popular ? 'plan--popular' : ''}`}>
      {plan.popular && <span className="plan__ribbon">Most popular</span>}
      <header className="plan__head">
        <span className="plan__icon">
          <plan.icon size={22} />
        </span>
        <div>
          <h3>{plan.name}</h3>
          <p>{plan.tagline}</p>
        </div>
      </header>

      <div className="plan__price">
        <strong>{formatMoney(pq.total)}</strong>
        <span>/month</span>
      </div>
      <p className="plan__save">
        <s>{formatMoney(pq.value)}</s>
        <em>Save {formatMoney(pq.savings)} a month</em>
      </p>

      <ul className="plan__list">
        {plan.items.map((item) => (
          <li key={item.label}>
            <Check size={16} /> {item.label}
          </li>
        ))}
      </ul>
      <ul className="plan__perks">
        {plan.perks.map((perk) => (
          <li key={perk}>
            <Sparkle size={12} /> {perk}
          </li>
        ))}
      </ul>

      <Link
        to={`/book?plan=${plan.id}&sqft=${sqft}`}
        className={`btn btn--block ${plan.popular ? 'btn--white' : 'btn--primary'}`}
      >
        Subscribe <ArrowRight size={18} />
      </Link>
    </article>
  )
}

const assurances = [
  { icon: CirclePause, text: 'Pause or cancel anytime — no lock-in' },
  { icon: Wallet, text: 'Pay monthly, nothing online today' },
  { icon: Users, text: 'The same trusted team every visit' },
  { icon: CalendarCheck, text: 'We plan the schedule around you' },
]

export default function CarePlans() {
  const [sqft, setSqft] = useState(1000)

  return (
    <section className="section plans-section" id="plans">
      <Bubbles items={[['3%', '12%', 34], ['93%', '8%', 22, 1], ['96%', '58%', 40, 2], ['6%', '70%', 18, 0.6]]} />
      <div className="container">
        <div className="section__head">
          <span className="eyebrow eyebrow--accent">
            <Repeat size={14} /> Care Plans · Monthly subscription
          </span>
          <h2>Subscribe once. Stay spotless all year.</h2>
          <p>
            Regular cleaning, seasonal deep cleans and pest control in one simple monthly price —
            save up to {savePercent} compared with booking each visit.
          </p>
        </div>
        <div className="plans__size">
          <span>Your home</span>
          <div className="chips" role="radiogroup" aria-label="Your home size">
            {bhkPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                role="radio"
                aria-checked={sqft === p.sqft}
                className={`chip ${sqft === p.sqft ? 'chip--active' : ''}`}
                onClick={() => setSqft(p.sqft)}
              >
                {p.label} <small>~{formatNumber(p.sqft)} sq.ft</small>
              </button>
            ))}
          </div>
        </div>

        <div className="plans">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} sqft={sqft} />
          ))}
        </div>

        <ul className="plans__assure">
          {assurances.map((a) => (
            <li key={a.text}>
              <a.icon size={18} /> {a.text}
            </li>
          ))}
        </ul>
        <p className="plans__note">
          Prices shown for the home size selected. Your exact plan price is confirmed at a free home
          visit before the first month starts.
        </p>
      </div>
    </section>
  )
}

/** Compact promo pointing to the Care Plans section. */
export function PlanBanner() {
  const from = Math.min(...plans.map((p) => planQuote(p, bhkPresets[0].sqft).total))
  return (
    <div className="plan-banner">
      <span className="plan-banner__icon">
        <Repeat size={22} />
      </span>
      <div>
        <strong>Prefer regular care? Try a Care Plan.</strong>
        <span>
          Bundled monthly cleaning and pest control from {formatMoney(from)}/month · save up to{' '}
          {savePercent}
        </span>
      </div>
      <Link to="/#plans" className="btn btn--primary">
        See plans <ArrowRight size={18} />
      </Link>
    </div>
  )
}
