import { bookingEndpoint, business } from '../data/config'
import type { PlanId } from '../data/plans'
import { extras, frequencies, unitLabels, type FrequencyId, type ServiceId } from '../data/services'
import { recordBooking } from './availability'
import { formatMoney, formatNumber, parseISODate } from './format'
import type { PlanQuote, Quote, Sizing } from './pricing'

export interface Contact {
  name: string
  email: string
  phone: string
  address: string
  city: string
  zip: string
  notes: string
}

export interface BookingDraft {
  serviceId: ServiceId | null
  /** Set instead of serviceId when subscribing to a Care Plan. */
  planId: PlanId | null
  frequency: FrequencyId
  sizing: Sizing
  extras: string[]
  date: string | null
  time: string | null
  contact: Contact
}

export interface Booking extends BookingDraft {
  serviceName: string
  reference: string
  createdAt: string
  quote: Quote | null
  planQuote: PlanQuote | null
  /** Length of the (first) visit, for the calendar entry. */
  durationHours: number
  /** Whether a confirmation email was sent to the customer. */
  emailed?: boolean
}

export type BookingPricing = Pick<Booking, 'quote' | 'planQuote' | 'durationHours'>

export const emptyDraft: BookingDraft = {
  serviceId: null,
  planId: null,
  frequency: 'once',
  sizing: { sqft: 1000, seats: 5 },
  extras: [],
  date: null,
  time: null,
  contact: { name: '', email: '', phone: '', address: '', city: business.city, zip: '', notes: '' },
}

const DRAFT_KEY = 'cleanspace.draft.v2'
const BOOKINGS_KEY = 'cleanspace.bookings'

export function loadDraft(): BookingDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Partial<BookingDraft>
      return {
        ...emptyDraft,
        ...saved,
        sizing: { ...emptyDraft.sizing, ...saved.sizing },
        contact: { ...emptyDraft.contact, ...saved.contact },
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return emptyDraft
}

export const saveDraft = (draft: BookingDraft) =>
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))

export const clearDraft = () => sessionStorage.removeItem(DRAFT_KEY)

const makeReference = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'CS-'
  for (let i = 0; i < 6; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)]
  return ref
}

export async function submitBooking(
  draft: BookingDraft,
  serviceName: string,
  pricing: BookingPricing,
): Promise<Booking> {
  const booking: Booking = {
    ...draft,
    ...pricing,
    serviceName,
    reference: makeReference(),
    createdAt: new Date().toISOString(),
  }

  const kind = draft.planId ? 'subscription' : 'booking'
  const { inCalendar, emailed } = await recordBooking({
    kind,
    reference: booking.reference,
    serviceName,
    date: booking.date!,
    time: booking.time!,
    durationHours: booking.durationHours,
    price: priceLabel(booking),
    details: bookingDetails(booking),
    contact: booking.contact,
  })

  booking.emailed = emailed
  const recorded = inCalendar || emailed

  if (bookingEndpoint) {
    const res = await fetch(bookingEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New ${kind} ${booking.reference} — ${serviceName}`,
        googleCalendar: inCalendar ? 'Added' : 'Not added — please add it manually',
        ...booking,
      }),
    })
    if (!res.ok && !recorded) {
      throw new Error('We could not send your booking. Please try again or message us on WhatsApp.')
    }
  } else if (!recorded) {
    await new Promise((r) => setTimeout(r, 700))
  }

  try {
    const existing = JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]') as Booking[]
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([booking, ...existing]))
  } catch {
    /* storage is best-effort */
  }

  return booking
}

const priceLabel = (b: Booking) =>
  b.planQuote
    ? `${formatMoney(b.planQuote.total)} a month`
    : `${formatMoney(b.quote!.total)}${b.quote!.estimateOnly ? ' (estimate)' : ''}`

function bookingDetails(b: Booking) {
  if (b.planQuote) return [`Home size: ${formatNumber(b.planQuote.sqft)} sq.ft`, 'First visit of a Care Plan']
  const q = b.quote!
  const unit = q.quantity === 1 ? unitLabels[q.unit].short : unitLabels[q.unit].plural
  const lines = [`Size: ${formatNumber(q.quantity)} ${unit}`]
  if (b.frequency !== 'once') lines.push(`Repeats: ${frequencies.find((f) => f.id === b.frequency)?.name}`)
  const extraNames = extras.filter((e) => b.extras.includes(e.id)).map((e) => e.name)
  if (extraNames.length) lines.push(`Add-ons: ${extraNames.join(', ')}`)
  return lines
}

/** Builds an .ics calendar file so customers can save the appointment. */
export function calendarFileUrl(b: Booking) {
  const start = parseISODate(b.date!)
  const [h, m] = b.time!.split(':').map(Number)
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + b.durationHours * 3600_000)
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const address = [b.contact.address, b.contact.city, b.contact.zip].filter(Boolean).join(', ')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Clean Space//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${b.reference}@cleanspace`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${business.name} — ${b.serviceName}`,
    `LOCATION:${address.replace(/,/g, '\\,')}`,
    `DESCRIPTION:Booking ref ${b.reference}. Questions? WhatsApp ${business.phone}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
}
