import { busyBetween, isConfigured, isDate, json, keralaTime } from './_google.js'

/**
 * GET /api/availability?date=YYYY-MM-DD
 * Returns the day's busy periods as [startMinute, endMinute] pairs,
 * counted from midnight Kerala time.
 */
export async function GET(request: Request) {
  if (!isConfigured()) return json({ error: 'Calendar not connected' }, 503)

  const date = new URL(request.url).searchParams.get('date')
  if (!isDate(date)) return json({ error: 'Invalid date' }, 400)

  const dayStart = keralaTime(date, '00:00')
  const dayEnd = new Date(dayStart.getTime() + 24 * 3600_000)
  const minute = (iso: string) =>
    Math.min(1440, Math.max(0, Math.round((Date.parse(iso) - dayStart.getTime()) / 60_000)))

  try {
    const busy = await busyBetween(dayStart, dayEnd)
    return json({ date, busy: busy.map((b) => [minute(b.start), minute(b.end)]) })
  } catch (e) {
    console.error(e)
    return json({ error: 'Could not read the calendar' }, 502)
  }
}
