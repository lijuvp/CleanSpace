import { TIME_ZONE, busyBetween, createEvent, isConfigured, isDate, isTime, json, keralaTime } from './_google.js'

interface CalendarBooking {
  reference: string
  serviceName: string
  date: string
  time: string
  durationHours: number
  price: string
  details: string[]
  contact: { name: string; phone: string; email: string; address: string; city: string; zip: string; notes: string }
}

const text = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/**
 * POST /api/book
 * Adds the booking to Google Calendar, or replies 409 if the time is no longer free.
 */
export async function POST(request: Request) {
  if (!isConfigured()) return json({ error: 'Calendar not connected' }, 503)

  let b: CalendarBooking
  try {
    b = (await request.json()) as CalendarBooking
  } catch {
    return json({ error: 'Invalid request' }, 400)
  }
  if (!isDate(b.date) || !isTime(b.time) || !b.contact) return json({ error: 'Invalid request' }, 400)

  const hours = Math.min(12, Math.max(0.5, Number(b.durationHours) || 1))
  const start = keralaTime(b.date, b.time)
  const end = new Date(start.getTime() + hours * 3600_000)

  try {
    if ((await busyBetween(start, end)).length > 0) {
      return json({ error: 'That time has just been booked' }, 409)
    }

    const c = b.contact
    const name = text(c.name, 100)
    const notes = text(c.notes, 1000)
    const description = [
      `Booking ref: ${text(b.reference, 20)}`,
      `Price: ${text(b.price, 100)}`,
      ...(Array.isArray(b.details) ? b.details.slice(0, 10).map((d) => text(d)) : []),
      '',
      `Customer: ${name}`,
      `Phone: ${text(c.phone, 30)}`,
      `Email: ${text(c.email, 100)}`,
      ...(notes ? [`Notes: ${notes}`] : []),
    ].join('\n')

    const event = await createEvent({
      summary: `${text(b.serviceName, 100)} — ${name}`,
      location: [c.address, c.city, c.zip].map((v) => text(v)).filter(Boolean).join(', '),
      description,
      start: { dateTime: start.toISOString(), timeZone: TIME_ZONE },
      end: { dateTime: end.toISOString(), timeZone: TIME_ZONE },
    })
    return json({ eventId: event.id })
  } catch (e) {
    console.error(e)
    return json({ error: 'Could not update the calendar' }, 502)
  }
}
