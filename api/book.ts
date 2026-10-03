import { TIME_ZONE, busyBetween, createEvent, isConfigured, isDate, isTime, json, keralaTime } from './_google.js'
import { mailConfigured, sendBookingEmails, type BookingEmail } from './_mail.js'

const text = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function clean(body: Record<string, unknown>): BookingEmail | null {
  const c = (body.contact ?? {}) as Record<string, unknown>
  const email = text(c.email, 100)
  if (!isDate(body.date) || !isTime(body.time) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return {
    kind: body.kind === 'subscription' ? 'subscription' : 'booking',
    reference: text(body.reference, 20),
    serviceName: text(body.serviceName, 100),
    date: body.date,
    time: body.time,
    durationHours: Math.min(12, Math.max(0.5, Number(body.durationHours) || 1)),
    price: text(body.price, 100),
    details: Array.isArray(body.details) ? body.details.slice(0, 10).map((d) => text(d)) : [],
    contact: {
      name: text(c.name, 100),
      phone: text(c.phone, 30),
      email,
      address: text(c.address),
      city: text(c.city, 100),
      zip: text(c.zip, 10),
      notes: text(c.notes, 1000),
    },
  }
}

async function addToCalendar(b: BookingEmail) {
  const start = keralaTime(b.date, b.time)
  const end = new Date(start.getTime() + b.durationHours * 3600_000)
  if ((await busyBetween(start, end)).length > 0) return 'taken' as const

  const c = b.contact
  const description = [
    `Booking ref: ${b.reference}`,
    `Price: ${b.price}`,
    ...b.details,
    '',
    `Customer: ${c.name}`,
    `Phone: ${c.phone}`,
    `Email: ${c.email}`,
    ...(c.notes ? [`Notes: ${c.notes}`] : []),
  ].join('\n')

  const event = await createEvent({
    summary: `${b.serviceName} — ${c.name}`,
    location: [c.address, c.city, c.zip].filter(Boolean).join(', '),
    description,
    start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
    end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
  })
  return event.id
}

/**
 * POST /api/book
 * Adds the booking to Google Calendar (409 if the time is no longer free),
 * then emails the customer a confirmation and the business a copy.
 */
export async function POST(request: Request) {
  if (!isConfigured() && !mailConfigured()) return json({ error: 'Not configured' }, 503)

  let b: BookingEmail | null
  try {
    b = clean((await request.json()) as Record<string, unknown>)
  } catch {
    b = null
  }
  if (!b) return json({ error: 'Invalid request' }, 400)

  let eventId: string | null = null
  if (isConfigured()) {
    try {
      const result = await addToCalendar(b)
      if (result === 'taken') return json({ error: 'That time has just been booked' }, 409)
      eventId = result
    } catch (e) {
      console.error(e)
    }
  }

  let emailed = false
  if (mailConfigured()) {
    try {
      await sendBookingEmails(b)
      emailed = true
    } catch (e) {
      console.error(e)
    }
  }

  return json({ eventId, emailed })
}
