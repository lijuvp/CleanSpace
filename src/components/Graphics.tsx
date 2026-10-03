import { useId, type CSSProperties } from 'react'

const STAR = 'M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z'

export function Sparkle({
  size = 24,
  className,
  style,
}: {
  size?: number | string
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} aria-hidden="true">
      <path d={STAR} fill="currentColor" />
    </svg>
  )
}

/** Twinkling stars that sit at the end of a line of text. */
export function SparkleCluster() {
  return (
    <span className="sparkle-cluster" aria-hidden="true">
      <Sparkle size="0.48em" className="twinkle" style={{ left: '0.1em', top: '-0.72em' }} />
      <Sparkle size="0.26em" className="twinkle twinkle--amber" style={{ left: '0.6em', top: '-0.92em', animationDelay: '0.6s' }} />
      <Sparkle size="0.2em" className="twinkle" style={{ left: '0.6em', top: '-0.36em', animationDelay: '1.2s' }} />
    </span>
  )
}

type BubbleSpec = [left: string, top: string, size: number, delay?: number]

/** Soft soap bubbles that bob gently in the background. */
export function Bubbles({ items, className = '' }: { items: BubbleSpec[]; className?: string }) {
  return (
    <div className={`bubbles ${className}`} aria-hidden="true">
      {items.map(([left, top, size, delay = 0], i) => (
        <span
          key={i}
          className="bubble"
          style={{ left, top, width: size, height: size, animationDelay: `${delay}s`, animationDuration: `${6 + (i % 4)}s` }}
        />
      ))}
    </div>
  )
}

export function SprayBottle({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 160 220" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a7f3e4" />
          <stop offset="1" stopColor="#2dd4bf" />
        </linearGradient>
        <clipPath id={`${id}c`}>
          <path d="M74 80h44c10 0 16 8 17 18l5 98c1 12-7 20-19 20H71c-12 0-20-8-19-20l5-98c1-10 7-18 17-18z" />
        </clipPath>
      </defs>
      <g fill="#2dd4bf">
        <circle cx="20" cy="36" r="3.2" opacity=".7" />
        <circle cx="10" cy="27" r="2.2" opacity=".55" />
        <circle cx="11" cy="46" r="2.6" opacity=".6" />
        <circle cx="1.5" cy="37" r="1.8" opacity=".45" />
        <circle cx="4" cy="18" r="1.4" opacity=".4" />
        <circle cx="3" cy="55" r="1.4" opacity=".4" />
      </g>
      <path d={STAR} transform="translate(-2 -6) scale(.7)" fill="#f59e0b" />
      <path d="M66 56c-4 14-8 24-14 36l8 3c8-11 14-25 16-39z" fill="#134e4a" />
      <rect x="36" y="30" width="28" height="12" rx="4" fill="#0f766e" />
      <rect x="29" y="31" width="9" height="10" rx="3" fill="#134e4a" />
      <rect x="60" y="22" width="60" height="36" rx="12" fill="#0f766e" />
      <rect x="68" y="28" width="30" height="5" rx="2.5" fill="#fff" opacity=".25" />
      <rect x="78" y="56" width="28" height="18" fill="#0f766e" />
      <rect x="72" y="70" width="40" height="11" rx="3" fill="#115e59" />
      <path d="M74 80h44c10 0 16 8 17 18l5 98c1 12-7 20-19 20H71c-12 0-20-8-19-20l5-98c1-10 7-18 17-18z" fill={`url(#${id}b)`} />
      <g clipPath={`url(#${id}c)`}>
        <path d="M40 134q15-8 30 0t30 0 30 0 30 0V230H40z" fill="#0d9488" opacity=".45" />
      </g>
      <rect x="72" y="140" width="52" height="44" rx="9" fill="#fff" opacity=".92" />
      <path d={STAR} transform="translate(87 151) scale(.92)" fill="#0d9488" />
      <rect x="64" y="94" width="7" height="86" rx="3.5" fill="#fff" opacity=".5" />
    </svg>
  )
}

export function Sponge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 110" className={className} aria-hidden="true">
      <g fill="#fff" fillOpacity=".75" stroke="#5eead4" strokeWidth="1.5">
        <circle cx="30" cy="20" r="11" />
        <circle cx="52" cy="10" r="7" />
        <circle cx="74" cy="22" r="9" />
        <circle cx="112" cy="14" r="6" />
      </g>
      <rect x="14" y="52" width="122" height="50" rx="10" fill="#fcd34d" />
      <g fill="#f59e0b" opacity=".55">
        <ellipse cx="36" cy="72" rx="5" ry="4" />
        <ellipse cx="62" cy="86" rx="4" ry="3" />
        <ellipse cx="90" cy="70" rx="6" ry="4" />
        <ellipse cx="114" cy="88" rx="4" ry="3" />
        <ellipse cx="46" cy="94" rx="3" ry="2" />
        <ellipse cx="104" cy="76" rx="3" ry="2" />
      </g>
      <rect x="14" y="40" width="122" height="18" rx="7" fill="#0f766e" />
      <g fill="#fff" stroke="#ccfbf1" strokeWidth="1.5">
        <circle cx="26" cy="41" r="8" />
        <circle cx="42" cy="37" r="9" />
        <circle cx="59" cy="41" r="7" />
      </g>
    </svg>
  )
}

export function BucketMop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 200" className={className} aria-hidden="true">
      <path d="M52 96c0-56 116-56 116 0" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="5" />
      <path d="M180 6 118 130" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
      <path d="m180 6-10 20" stroke="#f59e0b" strokeWidth="11" strokeLinecap="round" />
      <path d="M40 98h140l-14 92H54z" fill="#fff" />
      <path d="M47 128h126l-3 18H50z" fill="#2dd4bf" />
      <path d="M62 112l6 66" stroke="#e2f7f3" strokeWidth="6" strokeLinecap="round" />
      <rect x="34" y="90" width="152" height="14" rx="7" fill="#ccfbf1" />
      <g fill="#fff" stroke="#99f6e4" strokeWidth="2">
        <circle cx="58" cy="86" r="16" />
        <circle cx="84" cy="76" r="20" />
        <circle cx="112" cy="80" r="17" />
        <circle cx="140" cy="74" r="15" />
        <circle cx="162" cy="86" r="13" />
      </g>
      <g fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2">
        <circle cx="38" cy="42" r="8" />
        <circle cx="22" cy="64" r="5" />
        <circle cx="198" cy="50" r="6" />
        <circle cx="206" cy="26" r="4" />
      </g>
      <path d={STAR} transform="translate(8 2) scale(.8)" fill="#fff" />
      <path d={STAR} transform="translate(192 98) scale(.6)" fill="#fcd34d" />
    </svg>
  )
}
