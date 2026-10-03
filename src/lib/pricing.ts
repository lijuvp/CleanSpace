import { extras, frequencies, unitLabels, type FrequencyId, type Service, type Unit } from '../data/services'
import { formatMoney } from './format'

export interface Sizing {
  sqft: number
  seats: number
}

export interface Quote {
  unit: Unit
  quantity: number
  rate: number
  base: number
  extrasTotal: number
  subtotal: number
  discount: number
  total: number
  hours: number
  team: number
  estimateOnly: boolean
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : min))

export const clampQuantity = (service: Service, sizing: Sizing) =>
  clamp(service.unit === 'seat' ? sizing.seats : sizing.sqft, service.range.min, service.range.max)

/** Keeps the entered size when switching between similar services, otherwise uses the new default. */
export function sizingForSwitch(from: Service | undefined, to: Service, sizing: Sizing): Sizing {
  if (to.unit === 'seat') return sizing
  const sameScale = from && from.range.min === to.range.min && from.range.max === to.range.max
  const inRange = sizing.sqft >= to.range.min && sizing.sqft <= to.range.max
  return sameScale && inRange ? sizing : { ...sizing, sqft: to.range.default }
}

export const unitRate = (service: Service, quantity: number) =>
  service.tiers?.find((t) => quantity <= t.upTo)?.rate ?? service.rate

export function quote(
  service: Service,
  sizing: Sizing,
  extraIds: string[],
  frequency: FrequencyId,
): Quote {
  const quantity = clampQuantity(service, sizing)
  const rate = unitRate(service, quantity)
  const base = quantity * rate

  const chosen = extras.filter((e) => extraIds.includes(e.id))
  const extrasTotal = chosen.reduce((sum, e) => sum + e.price, 0)
  const minutes =
    quantity * service.minutesPerUnit + chosen.reduce((sum, e) => sum + e.minutes, 0)
  const hours = Math.max(1, minutes / 60)

  const subtotal = base + extrasTotal
  const discountRate = service.recurring
    ? (frequencies.find((f) => f.id === frequency)?.discount ?? 0)
    : 0
  const discount = subtotal * discountRate

  // Big jobs get a team so the visit stays within a working day.
  const team = Math.max(1, Math.ceil(hours / 4))

  return {
    unit: service.unit,
    quantity,
    rate,
    base,
    extrasTotal,
    subtotal,
    discount,
    total: subtotal - discount,
    hours: hours / team,
    team,
    estimateOnly: !!service.fromPrice,
  }
}

/** Rate card label, e.g. "₹6/sq.ft", "from ₹2/sq.ft", "₹7–₹10/sq.ft". */
export function rateLabel(service: Service) {
  const unit = `/${unitLabels[service.unit].short}`
  if (service.tiers) {
    const rates = service.tiers.map((t) => t.rate)
    return {
      prefix: '',
      amount: `${formatMoney(Math.min(...rates))}–${formatMoney(Math.max(...rates))}`,
      unit,
    }
  }
  return { prefix: service.fromPrice ? 'from' : '', amount: formatMoney(service.rate), unit }
}

export const rateText = (service: Service) => {
  const r = rateLabel(service)
  return `${r.prefix ? `${r.prefix} ` : ''}${r.amount}${r.unit}`
}
