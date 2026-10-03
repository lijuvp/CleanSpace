import { Link } from 'react-router-dom'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label="Clean Space home">
      <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden="true">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#14b8a6" />
            <stop offset="1" stopColor="#0f766e" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#logo-g)" />
        <path d="M32 12l4.2 11.8L48 28l-11.8 4.2L32 44l-4.2-11.8L16 28l11.8-4.2z" fill="#fff" />
        <circle cx="46" cy="46" r="4" fill="#fff" opacity=".85" />
        <circle cx="19" cy="45" r="2.5" fill="#fff" opacity=".7" />
      </svg>
      <span>
        Clean<strong>Space</strong>
      </span>
    </Link>
  )
}
