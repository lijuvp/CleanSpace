import { Minus, Plus } from 'lucide-react'

interface Props {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}

export default function Counter({ label, value, min = 0, max = 10, step = 1, suffix, onChange }: Props) {
  return (
    <div className="counter">
      <span className="counter__label">{label}</span>
      <div className="counter__controls">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - step))}
        >
          <Minus size={16} />
        </button>
        <output aria-live="polite">
          {value.toLocaleString()}
          {suffix && <small> {suffix}</small>}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + step))}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
