import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { business } from '../data/config'
import { parseISODate, toISODate } from '../lib/format'

interface Props {
  value: string | null
  onChange: (iso: string) => void
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export default function Calendar({ value, onChange }: Props) {
  const [today] = useState(() => startOfDay(new Date()))
  const first = addDays(today, business.minNoticeDays)
  const last = addDays(today, business.bookingWindowDays)

  const initial = value ? parseISODate(value) : first
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1))

  const weekdays = useMemo(() => {
    const sunday = new Date(2024, 0, 7)
    return Array.from({ length: 7 }, (_, i) =>
      addDays(sunday, i).toLocaleDateString(business.locale, { weekday: 'short' }),
    )
  }, [])

  const days = useMemo(() => {
    const lead = view.getDay()
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)),
    ]
  }, [view])

  const isAvailable = (d: Date) =>
    d >= first && d <= last && !business.closedWeekdays.includes(d.getDay())

  const canPrev = view > new Date(first.getFullYear(), first.getMonth(), 1)
  const canNext = new Date(view.getFullYear(), view.getMonth() + 1, 1) <= last

  return (
    <div className="calendar">
      <div className="calendar__head">
        <button
          type="button"
          aria-label="Previous month"
          disabled={!canPrev}
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
        >
          <ChevronLeft size={18} />
        </button>
        <strong aria-live="polite">
          {view.toLocaleDateString(business.locale, { month: 'long', year: 'numeric' })}
        </strong>
        <button
          type="button"
          aria-label="Next month"
          disabled={!canNext}
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="calendar__grid">
        {weekdays.map((w) => (
          <span key={w} className="calendar__weekday">
            {w}
          </span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`pad-${i}`} />
          const iso = toISODate(d)
          const available = isAvailable(d)
          const selected = iso === value
          const isToday = d.getTime() === today.getTime()
          return (
            <button
              key={iso}
              type="button"
              disabled={!available}
              aria-pressed={selected}
              aria-label={d.toLocaleDateString(business.locale, { dateStyle: 'full' })}
              className={`calendar__day ${selected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
              onClick={() => onChange(iso)}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
