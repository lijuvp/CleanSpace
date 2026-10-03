/** Busy periods for one day, as [startMinute, endMinute] from midnight Kerala time. */
export type BusyRanges = [number, number][]

export interface CalendarBooking {
  kind: 'booking' | 'subscription'
  reference: string
  serviceName: string
  date: string
  time: string
  durationHours: number
  price: string
  details: string[]
  contact: { name: string; phone: string; email: string; address: string; city: string; zip: string; notes: string }
}

export class SlotTakenError extends Error {
  constructor() {
    super('Sorry, that time was just booked by someone else. Please pick another time.')
  }
}

const api = `${import.meta.env.BASE_URL}api`

async function readJson(res: Response) {
  if (!res.headers.get('content-type')?.includes('application/json')) return null
  return res.json().catch(() => null)
}

/**
 * Busy periods from the Google Calendar, or null when the calendar isn't
 * connected or can't be reached (every slot is then offered).
 */
export async function fetchBusy(date: string, signal?: AbortSignal): Promise<BusyRanges | null> {
  try {
    const res = await fetch(`${api}/availability?date=${date}`, { signal })
    const data = res.ok ? await readJson(res) : null
    return Array.isArray(data?.busy) ? (data.busy as BusyRanges) : null
  } catch {
    return null
  }
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * 'booked': something is already scheduled at that time.
 * 'no-room': the time is free, but the visit would run into the next booking.
 */
export type SlotStatus = 'free' | 'booked' | 'no-room'

export function slotStatus(time: string, hours: number, busy: BusyRanges): SlotStatus {
  const start = toMinutes(time)
  const end = start + Math.ceil(hours * 60)
  if (busy.some(([s, e]) => start >= s && start < e)) return 'booked'
  if (busy.some(([s, e]) => start < e && end > s)) return 'no-room'
  return 'free'
}

export interface RecordResult {
  inCalendar: boolean
  emailed: boolean
}

/**
 * Adds the booking to the Google Calendar and emails the customer and the
 * business. Throws SlotTakenError if the time is no longer free.
 */
export async function recordBooking(booking: CalendarBooking): Promise<RecordResult> {
  try {
    const res = await fetch(`${api}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    })
    if (res.status === 409) throw new SlotTakenError()
    const data = res.ok ? await readJson(res) : null
    return { inCalendar: !!data?.eventId, emailed: data?.emailed === true }
  } catch (e) {
    if (e instanceof SlotTakenError) throw e
    return { inCalendar: false, emailed: false }
  }
}
