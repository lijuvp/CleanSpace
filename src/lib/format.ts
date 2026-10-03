import { business } from '../data/config'

const money = new Intl.NumberFormat(business.locale, {
  style: 'currency',
  currency: business.currency,
  maximumFractionDigits: 0,
})

export const formatMoney = (value: number) => money.format(Math.round(value))

export const formatNumber = (value: number) => value.toLocaleString(business.locale)

export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(business.locale, { hour: 'numeric', minute: '2-digit' })
}

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  parseISODate(iso).toLocaleDateString(business.locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...opts,
  })

export const formatHours = (hours: number) => {
  const rounded = Math.round(hours * 2) / 2
  return `${rounded} ${rounded === 1 ? 'hour' : 'hours'}`
}

/** YYYY-MM-DD in local time. */
export const toISODate = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const parseISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
