import { useId, useState } from 'react'
import { bhkPresets, type Service } from '../data/services'
import { formatMoney, formatNumber } from '../lib/format'
import { clampQuantity, unitRate, type Sizing } from '../lib/pricing'
import Counter from './Counter'

interface Props {
  service: Service
  sizing: Sizing
  onChange: (sizing: Sizing) => void
}

export default function SizeInput({ service, sizing, onChange }: Props) {
  const id = useId()
  const { min, max, step } = service.range
  const sqft = clampQuantity(service, sizing)
  // Raw text while the user is typing; falls back to the committed value.
  const [typing, setTyping] = useState<string | null>(null)

  if (service.unit === 'seat') {
    return (
      <div className="size-input">
        <Counter
          label="Number of seats"
          value={sizing.seats}
          min={min}
          max={max}
          onChange={(seats) => onChange({ ...sizing, seats })}
        />
        <p className="hint hint--tight">A 3-seater sofa counts as 3 seats. Include recliners and chairs.</p>
      </div>
    )
  }

  const setSqft = (value: number) =>
    onChange({ ...sizing, sqft: Math.min(max, Math.max(min, Math.round(value))) })

  return (
    <div className="size-input range-field">
      <div className="range-field__head">
        <label htmlFor={`${id}-sqft`}>Area to be {service.category === 'pest' ? 'treated' : 'cleaned'}</label>
        <div className="sqft-box">
          <input
            id={`${id}-sqft`}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={typing ?? sqft}
            onChange={(e) => {
              setTyping(e.target.value)
              const v = Number(e.target.value)
              if (e.target.value && v >= min && v <= max) setSqft(v)
            }}
            onBlur={() => {
              if (typing !== null) setSqft(Number(typing) || min)
              setTyping(null)
            }}
          />
          <span>sq.ft</span>
        </div>
      </div>

      {service.bhkPresets && (
        <div className="chips" role="group" aria-label="Quick pick by home size">
          {bhkPresets
            .filter((p) => p.sqft >= min && p.sqft <= max)
            .map((p) => (
              <button
                key={p.label}
                type="button"
                className={`chip ${sqft === p.sqft ? 'chip--active' : ''}`}
                aria-pressed={sqft === p.sqft}
                onClick={() => setSqft(p.sqft)}
              >
                {p.label} <small>~{formatNumber(p.sqft)}</small>
              </button>
            ))}
        </div>
      )}

      <input
        type="range"
        aria-label="Area in square feet"
        min={min}
        max={max}
        step={step}
        value={sqft}
        onChange={(e) => setSqft(Number(e.target.value))}
      />
      <div className="range-field__scale">
        <span>{formatNumber(min)}</span>
        <span>{formatNumber(max)}+ sq.ft</span>
      </div>

      {service.tiers && (
        <ul className="tiers" aria-label="Volume pricing">
          {service.tiers.map((t, i) => {
            const from = i === 0 ? min : service.tiers![i - 1].upTo + 1
            const active = unitRate(service, sqft) === t.rate
            return (
              <li key={t.rate} className={active ? 'is-active' : ''}>
                <span>
                  {t.upTo === Infinity
                    ? `${formatNumber(from)}+ sq.ft`
                    : `${formatNumber(from)}–${formatNumber(t.upTo)} sq.ft`}
                </span>
                <strong>{formatMoney(t.rate)}/sq.ft</strong>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
