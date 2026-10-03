import { createSign } from 'node:crypto'

/** Kerala time. India has no daylight saving, so the offset is fixed. */
export const TIME_ZONE = 'Asia/Kolkata'
const UTC_OFFSET = '+05:30'

export interface Interval {
  start: string
  end: string
}

const config = () => ({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  // Vercel stores the key on one line, with literal "\n" sequences.
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  calendarId: process.env.GOOGLE_CALENDAR_ID,
})

export const isConfigured = () => {
  const { email, key, calendarId } = config()
  return !!(email && key && calendarId)
}

let token: { value: string; expires: number } | null = null

async function accessToken() {
  if (token && token.expires > Date.now() + 60_000) return token.value

  const { email, key } = config()
  const now = Math.floor(Date.now() / 1000)
  const encode = (part: object) => Buffer.from(JSON.stringify(part)).toString('base64url')
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: email,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key!, 'base64url')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${signature}`,
    }),
  })
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status}): ${await res.text()}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 }
  return token.value
}

async function calendarApi<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Google Calendar ${path} failed (${res.status}): ${await res.text()}`)
  return (await res.json()) as T
}

/** Busy periods on the bookings calendar between two instants. */
export async function busyBetween(from: Date, to: Date): Promise<Interval[]> {
  const { calendarId } = config()
  const data = await calendarApi<{
    calendars: Record<string, { busy?: Interval[]; errors?: { reason: string }[] }>
  }>('/freeBusy', {
    timeMin: from.toISOString(),
    timeMax: to.toISOString(),
    timeZone: TIME_ZONE,
    items: [{ id: calendarId }],
  })
  const calendar = data.calendars[calendarId!]
  // "notFound" here usually means the calendar isn't shared with the service account.
  if (calendar?.errors?.length) {
    throw new Error(`Calendar unavailable: ${calendar.errors.map((e) => e.reason).join(', ')}`)
  }
  return calendar?.busy ?? []
}

export function createEvent(event: object) {
  const { calendarId } = config()
  return calendarApi<{ id: string }>(`/calendars/${encodeURIComponent(calendarId!)}/events`, event)
}

export const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
export const isTime = (v: unknown): v is string => typeof v === 'string' && /^\d{2}:\d{2}$/.test(v)

/** A wall-clock date and time in Kerala as an instant. */
export const keralaTime = (date: string, time: string) => new Date(`${date}T${time}:00${UTC_OFFSET}`)

export const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
