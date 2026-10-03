import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronUp,
  CircleCheck,
  Clock,
  Info,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Repeat,
  User,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { Rate } from '../components/ServiceCard'
import SizeInput from '../components/SizeInput'
import { Sparkle } from '../components/Graphics'
import { savePercent } from '../components/Plans'
import { bookingEndpoint, business } from '../data/config'
import { getPlan, plans, type Plan, type PlanId } from '../data/plans'
import {
  categories,
  extras,
  frequencies,
  getService,
  services,
  timeSlots,
  unitLabels,
  type FrequencyId,
  type Service,
} from '../data/services'
import {
  calendarFileUrl,
  clearDraft,
  loadDraft,
  saveDraft,
  submitBooking,
  type Booking,
  type BookingDraft,
  type Contact,
} from '../lib/booking'
import { formatDate, formatHours, formatMoney, formatNumber, formatTime } from '../lib/format'
import {
  clampQuantity,
  planQuote,
  quote,
  sizingForSwitch,
  type PlanQuote,
  type Quote,
} from '../lib/pricing'

const STEPS = ['Service', 'Details', 'Schedule', 'Your info', 'Review'] as const

/** Plans are sized like a regular home clean. */
const planSizing = getService('regular')!

function initialDraft(params: URLSearchParams): BookingDraft {
  const draft = loadDraft()
  const plan = getPlan(params.get('plan'))
  const service = getService(params.get('service'))
  if (!plan && !service) return draft

  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key))
    return params.has(key) && Number.isFinite(v) ? v : fallback
  }

  if (plan) {
    return {
      ...draft,
      planId: plan.id,
      serviceId: null,
      sizing: { ...draft.sizing, sqft: num('sqft', draft.sizing.sqft) },
    }
  }

  const freq = params.get('frequency') as FrequencyId | null
  return {
    ...draft,
    planId: null,
    serviceId: service!.id,
    frequency: frequencies.some((f) => f.id === freq) ? freq! : draft.frequency,
    sizing: {
      sqft: num('sqft', draft.sizing.sqft),
      seats: num('seats', draft.sizing.seats),
    },
  }
}

function validateContact(c: Contact) {
  const errors: Partial<Record<keyof Contact, string>> = {}
  if (c.name.trim().length < 2) errors.name = 'Please enter your name'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) errors.email = 'Enter a valid email address'
  if (c.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid 10-digit mobile number'
  if (c.address.trim().length < 3) errors.address = 'Where should we come?'
  if (c.city.trim().length < 2) errors.city = 'Please enter your city'
  if (c.zip.trim() && !/^\d{6}$/.test(c.zip.replace(/\s/g, ''))) errors.zip = 'PIN code should be 6 digits'
  return errors
}

export default function Book() {
  const [params] = useSearchParams()
  const [draft, setDraft] = useState<BookingDraft>(() => initialDraft(params))
  const [step, setStep] = useState(() =>
    getService(params.get('service')) || getPlan(params.get('plan')) ? 1 : 0,
  )
  const [showErrors, setShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (!booking) saveDraft(draft)
  }, [draft, booking])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    headingRef.current?.focus({ preventScroll: true })
  }, [step, booking])

  const plan = getPlan(draft.planId)
  const service = plan ? undefined : getService(draft.serviceId)
  const planSqft = clampQuantity(planSizing, draft.sizing)
  const pq = plan ? planQuote(plan, planSqft) : null
  const frequency: FrequencyId = service?.recurring ? draft.frequency : 'once'
  const availableExtras = service
    ? extras.filter((e) => e.categories.includes(service.category))
    : []
  const extraIds = draft.extras.filter((id) => availableExtras.some((e) => e.id === id))
  const q = service ? quote(service, draft.sizing, extraIds, frequency) : null
  const contactErrors = validateContact(draft.contact)
  const pin = draft.contact.zip.replace(/\s/g, '')
  const outsideArea = /^\d{6}$/.test(pin) && !pin.startsWith(business.pinPrefix)

  const visitHours = pq?.visitHours ?? q?.hours
  const stepValid = [
    !!service || !!plan,
    true,
    !!draft.date && !!draft.time,
    Object.keys(contactErrors).length === 0,
    true,
  ]
  const furthestAllowed = stepValid.findIndex((v) => !v)
  const canVisit = (i: number) => furthestAllowed === -1 || i <= furthestAllowed

  const update = (patch: Partial<BookingDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const updateContact = (patch: Partial<Contact>) =>
    setDraft((d) => ({ ...d, contact: { ...d.contact, ...patch } }))

  const goTo = (i: number) => {
    setShowErrors(false)
    setSummaryOpen(false)
    setStep(i)
  }

  const submit = async () => {
    if (!(plan && pq) && !(service && q)) return
    setSubmitting(true)
    setError('')
    try {
      const result =
        plan && pq
          ? await submitBooking(
              { ...draft, serviceId: null, frequency: 'once', extras: [], sizing: { ...draft.sizing, sqft: planSqft } },
              `${plan.name} Care Plan`,
              { quote: null, planQuote: pq, durationHours: pq.visitHours },
            )
          : await submitBooking(
              { ...draft, planId: null, serviceId: service!.id, frequency, extras: extraIds },
              service!.name,
              { quote: q, planQuote: null, durationHours: q!.hours },
            )
      clearDraft()
      setBooking(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const next = () => {
    if (!stepValid[step]) {
      setShowErrors(true)
      return
    }
    if (step === STEPS.length - 1) submit()
    else goTo(step + 1)
  }

  if (booking) {
    return <Confirmation booking={booking} headingRef={headingRef} />
  }

  return (
    <div className="booking">
      <div className="container">
        <ol className="stepper" aria-label="Booking progress">
          {STEPS.map((label, i) => {
            const state = i < step ? 'done' : i === step ? 'current' : 'todo'
            return (
              <li key={label} className={`stepper__item is-${state}`}>
                <button
                  type="button"
                  disabled={!canVisit(i) || i === step}
                  onClick={() => goTo(i)}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span className="stepper__dot">{state === 'done' ? <Check size={14} /> : i + 1}</span>
                  <span className="stepper__label">{label}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="booking__grid">
          <div className="booking__main">
            <div className="panel" key={step}>
              {step === 0 && (
                <StepServices
                  headingRef={headingRef}
                  selected={draft.serviceId}
                  selectedPlan={draft.planId}
                  planSqft={planSqft}
                  onSelect={(id) => {
                    update({
                      serviceId: id,
                      planId: null,
                      sizing: sizingForSwitch(service ?? (plan && planSizing), getService(id)!, draft.sizing),
                    })
                    goTo(1)
                  }}
                  onSelectPlan={(id) => {
                    update({
                      planId: id,
                      serviceId: null,
                      sizing: sizingForSwitch(service ?? (plan && planSizing), planSizing, draft.sizing),
                    })
                    goTo(1)
                  }}
                />
              )}

              {step === 1 && plan && pq && (
                <section>
                  <StepHeading headingRef={headingRef} title="Choose your plan">
                    Pick a plan and your home size — your monthly price updates instantly.
                  </StepHeading>
                  <div className="option-grid option-grid--3" role="radiogroup" aria-label="Care Plan">
                    {plans.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={p.id === plan.id}
                        className={`option option--plan ${p.id === plan.id ? 'option--active' : ''}`}
                        onClick={() => update({ planId: p.id })}
                      >
                        {p.popular && <em className="badge">Popular</em>}
                        <span className="option__icon">
                          <p.icon size={20} />
                        </span>
                        <strong>{p.name}</strong>
                        <span className="option__price">
                          {formatMoney(planQuote(p, planSqft).total)}
                          <small>per month</small>
                        </span>
                      </button>
                    ))}
                  </div>

                  <h3 className="group-title">Home size</h3>
                  <SizeInput service={planSizing} sizing={draft.sizing} onChange={(sizing) => update({ sizing })} />

                  <h3 className="group-title">What’s included</h3>
                  <PlanIncludes plan={plan} />
                </section>
              )}

              {step === 1 && service && (
                <section>
                  <StepHeading
                    headingRef={headingRef}
                    title={service.unit === 'seat' ? 'How many seats?' : 'How big is the area?'}
                  >
                    {service.name} · adjust the details and your price updates instantly.
                  </StepHeading>

                  <h3 className="group-title">{service.unit === 'seat' ? 'Seats' : 'Area'}</h3>
                  <SizeInput
                    service={service}
                    sizing={draft.sizing}
                    onChange={(sizing) => update({ sizing })}
                  />

                  {service.recurring && (
                    <>
                      <h3 className="group-title">How often?</h3>
                      <div className="option-grid option-grid--4" role="radiogroup" aria-label="Frequency">
                        {frequencies.map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            role="radio"
                            aria-checked={draft.frequency === f.id}
                            className={`option ${draft.frequency === f.id ? 'option--active' : ''}`}
                            onClick={() => update({ frequency: f.id })}
                          >
                            <strong>{f.name}</strong>
                            <span className={f.discount ? 'text-accent' : ''}>{f.note}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {availableExtras.length > 0 && (
                    <h3 className="group-title">
                      Add-ons <span className="muted small">(optional)</span>
                    </h3>
                  )}
                  <div className="option-grid option-grid--3">
                    {availableExtras.map((e) => {
                      const active = extraIds.includes(e.id)
                      return (
                        <button
                          key={e.id}
                          type="button"
                          aria-pressed={active}
                          className={`option option--extra ${active ? 'option--active' : ''}`}
                          onClick={() =>
                            update({
                              extras: active
                                ? draft.extras.filter((x) => x !== e.id)
                                : [...draft.extras, e.id],
                            })
                          }
                        >
                          <span className="option__check">{active && <Check size={14} />}</span>
                          <e.icon size={22} />
                          <strong>{e.name}</strong>
                          <span>+{formatMoney(e.price)}</span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section>
                  <StepHeading headingRef={headingRef} title={plan ? 'When should we start?' : 'When should we come?'}>
                    {plan
                      ? 'Pick a date and time for your first visit. We’ll agree the regular schedule with you on the call.'
                      : `Pick a date and arrival time. Our hours: ${business.hours}.`}
                  </StepHeading>
                  <div className="schedule">
                    <Calendar value={draft.date} onChange={(date) => update({ date })} />
                    <div className="slots">
                      <h3 className="group-title">
                        {draft.date ? formatDate(draft.date) : 'Arrival time'}
                      </h3>
                      <div className="slots__grid" role="radiogroup" aria-label="Arrival time">
                        {timeSlots.map((t) => (
                          <button
                            key={t}
                            type="button"
                            role="radio"
                            aria-checked={draft.time === t}
                            className={`slot ${draft.time === t ? 'slot--active' : ''}`}
                            onClick={() => update({ time: t })}
                          >
                            <Clock size={16} /> {formatTime(t)}
                          </button>
                        ))}
                      </div>
                      <p className="hint">
                        <Info size={16} /> Our team arrives within 30 minutes of the chosen time.
                        {visitHours && ` Estimated duration: ${formatHours(visitHours)}.`}
                      </p>
                      {showErrors && !stepValid[2] && (
                        <p className="form-error" role="alert">
                          Please choose {!draft.date ? 'a date' : 'an arrival time'} to continue.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section>
                  <StepHeading headingRef={headingRef} title="Where and who?">
                    We’ll send your confirmation and any updates here.
                  </StepHeading>
                  <form
                    className="form-grid"
                    onSubmit={(e) => {
                      e.preventDefault()
                      next()
                    }}
                    noValidate
                  >
                    <Field label="Full name" error={showErrors ? contactErrors.name : undefined}>
                      <input
                        autoComplete="name"
                        value={draft.contact.name}
                        onChange={(e) => updateContact({ name: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone" error={showErrors ? contactErrors.phone : undefined}>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={draft.contact.phone}
                        onChange={(e) => updateContact({ phone: e.target.value })}
                      />
                    </Field>
                    <Field label="Email" wide error={showErrors ? contactErrors.email : undefined}>
                      <input
                        type="email"
                        autoComplete="email"
                        value={draft.contact.email}
                        onChange={(e) => updateContact({ email: e.target.value })}
                      />
                    </Field>
                    <Field label="Flat / house no., street, area" wide error={showErrors ? contactErrors.address : undefined}>
                      <input
                        autoComplete="street-address"
                        value={draft.contact.address}
                        onChange={(e) => updateContact({ address: e.target.value })}
                      />
                    </Field>
                    <Field label="City" error={showErrors ? contactErrors.city : undefined}>
                      <input
                        autoComplete="address-level2"
                        value={draft.contact.city}
                        onChange={(e) => updateContact({ city: e.target.value })}
                      />
                    </Field>
                    <Field
                      label="PIN code"
                      optional
                      error={showErrors ? contactErrors.zip : undefined}
                      note={outsideArea ? `We mainly serve ${business.city} — we’ll confirm we can reach you when we call.` : undefined}
                    >
                      <input
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder={`${business.pinPrefix}001`}
                        maxLength={7}
                        value={draft.contact.zip}
                        onChange={(e) => updateContact({ zip: e.target.value })}
                      />
                    </Field>
                    <Field label="Access & special instructions" wide optional>
                      <textarea
                        rows={3}
                        placeholder="Landmark, parking, gate pass, pets, areas to focus on…"
                        value={draft.contact.notes}
                        onChange={(e) => updateContact({ notes: e.target.value })}
                      />
                    </Field>
                    <button type="submit" hidden />
                  </form>
                </section>
              )}

              {step === 4 && plan && pq && (
                <section>
                  <StepHeading headingRef={headingRef} title="Review & subscribe">
                    Check everything looks right. You won’t be charged today.
                  </StepHeading>
                  <div className="review">
                    <ReviewRow icon={<Repeat size={18} />} label="Plan" onEdit={() => goTo(1)}>
                      {plan.name} Care Plan · {formatNumber(pq.sqft)} sq.ft home
                    </ReviewRow>
                    <ReviewRow icon={<CalendarDays size={18} />} label="First visit" onEdit={() => goTo(2)}>
                      {formatDate(draft.date!)} at {formatTime(draft.time!)}
                    </ReviewRow>
                    <ReviewRow icon={<MapPin size={18} />} label="Where" onEdit={() => goTo(3)}>
                      {[draft.contact.address, draft.contact.city, draft.contact.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </ReviewRow>
                    <ReviewRow icon={<User size={18} />} label="Contact" onEdit={() => goTo(3)}>
                      {draft.contact.name} · {draft.contact.email} · {draft.contact.phone}
                    </ReviewRow>
                    {draft.contact.notes && (
                      <ReviewRow icon={<Pencil size={18} />} label="Notes" onEdit={() => goTo(3)}>
                        {draft.contact.notes}
                      </ReviewRow>
                    )}
                  </div>
                  <div className="review__total">
                    <PlanBreakdown pq={pq} />
                  </div>
                  <p className="hint">
                    <Lock size={16} /> No payment now. You pay monthly after each month’s visits, and
                    can pause or cancel anytime.
                  </p>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                </section>
              )}

              {step === 4 && service && q && (
                <section>
                  <StepHeading headingRef={headingRef} title="Review & confirm">
                    Check everything looks right. You won’t be charged today.
                  </StepHeading>
                  <div className="review">
                    <ReviewRow icon={<CircleCheck size={18} />} label="Service" onEdit={() => goTo(0)}>
                      {service.name}
                      {service.recurring && ` · ${frequencies.find((f) => f.id === frequency)!.name}`}
                    </ReviewRow>
                    <ReviewRow icon={<Info size={18} />} label="Details" onEdit={() => goTo(1)}>
                      {quantityLabel(q)}
                      {extraIds.length > 0 &&
                        ` · ${availableExtras
                          .filter((e) => extraIds.includes(e.id))
                          .map((e) => e.name)
                          .join(', ')}`}
                    </ReviewRow>
                    <ReviewRow icon={<CalendarDays size={18} />} label="When" onEdit={() => goTo(2)}>
                      {formatDate(draft.date!)} at {formatTime(draft.time!)} · ≈ {formatHours(q.hours)}
                    </ReviewRow>
                    <ReviewRow icon={<MapPin size={18} />} label="Where" onEdit={() => goTo(3)}>
                      {[draft.contact.address, draft.contact.city, draft.contact.zip]
                        .filter(Boolean)
                        .join(', ')}
                    </ReviewRow>
                    <ReviewRow icon={<User size={18} />} label="Contact" onEdit={() => goTo(3)}>
                      {draft.contact.name} · {draft.contact.email} · {draft.contact.phone}
                    </ReviewRow>
                    {draft.contact.notes && (
                      <ReviewRow icon={<Pencil size={18} />} label="Notes" onEdit={() => goTo(3)}>
                        {draft.contact.notes}
                      </ReviewRow>
                    )}
                  </div>
                  <div className="review__total">
                    <PriceBreakdown q={q} />
                  </div>
                  <p className="hint">
                    <Lock size={16} /> No payment now. You’ll pay after the service. Free cancellation
                    up to 24 hours before.
                  </p>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                </section>
              )}
            </div>

            {summaryOpen && (plan || service) && (
              <div className="summary-sheet">
                {plan && pq ? (
                  <PlanSummary plan={plan} draft={draft} pq={pq} />
                ) : (
                  <Summary service={service!} draft={draft} frequency={frequency} extraIds={extraIds} q={q!} />
                )}
              </div>
            )}

            <div className="step-footer">
              {step > 0 ? (
                <button type="button" className="btn btn--ghost" onClick={() => goTo(step - 1)}>
                  <ArrowLeft size={18} /> <span className="hide-sm">Back</span>
                </button>
              ) : (
                <Link to="/" className="btn btn--ghost">
                  <ArrowLeft size={18} /> <span className="hide-sm">Home</span>
                </Link>
              )}

              {(pq || q) && (
                <button
                  type="button"
                  className="step-footer__total"
                  onClick={() => setSummaryOpen((o) => !o)}
                  aria-expanded={summaryOpen}
                >
                  <small>{pq ? 'Per month' : 'Total'}</small>
                  <strong>{formatMoney(pq ? pq.total : q!.total)}</strong>
                  <ChevronUp size={16} className={summaryOpen ? 'flip' : ''} />
                </button>
              )}

              {(step > 0 || service || plan) && (
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={next}
                  disabled={submitting}
                >
                  {step === STEPS.length - 1 ? (
                    submitting ? (
                      <>
                        <span className="spinner spinner--light" /> {plan ? 'Subscribing…' : 'Booking…'}
                      </>
                    ) : (
                      <>
                        {plan ? 'Confirm subscription' : 'Confirm booking'} <Check size={18} />
                      </>
                    )
                  ) : (
                    <>
                      Continue <ArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <aside className="booking__aside">
            {plan && pq ? (
              <PlanSummary plan={plan} draft={draft} pq={pq} />
            ) : service && q ? (
              <Summary service={service} draft={draft} frequency={frequency} extraIds={extraIds} q={q} />
            ) : (
              <div className="summary summary--empty">
                <h3>Your booking</h3>
                <p className="muted">Choose a service to see your instant price.</p>
              </div>
            )}
            <ul className="assurances">
              <li><CircleCheck size={16} /> Verified, trained professionals</li>
              <li><CircleCheck size={16} /> Redo guarantee</li>
              <li><CircleCheck size={16} /> Free cancellation up to 24h</li>
            </ul>
          </aside>
        </div>
      </div>
    </div>
  )
}

function StepHeading({
  title,
  children,
  headingRef,
}: {
  title: string
  children: ReactNode
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <header className="step-heading">
      <h1 ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
      <p>{children}</p>
    </header>
  )
}

function StepServices({
  selected,
  selectedPlan,
  planSqft,
  onSelect,
  onSelectPlan,
  headingRef,
}: {
  selected: string | null
  selectedPlan: PlanId | null
  planSqft: number
  onSelect: (id: Service['id']) => void
  onSelectPlan: (id: PlanId) => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section>
      <StepHeading headingRef={headingRef} title="What do you need?">
        Select a service or a monthly Care Plan — you’ll see your exact price on the next step.
      </StepHeading>
      <h3 className="group-title">
        Care Plans · monthly subscription <em className="badge badge--inline">Save up to {savePercent}</em>
      </h3>
      <div className="option-grid">
        {plans.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`option option--service ${selectedPlan === p.id ? 'option--active' : ''}`}
            aria-pressed={selectedPlan === p.id}
            onClick={() => onSelectPlan(p.id)}
          >
            <span className="option__icon">
              <p.icon size={22} />
            </span>
            <span className="option__body">
              <strong>
                {p.name} Care Plan
                {p.popular && <em className="badge badge--inline">Popular</em>}
              </strong>
              <span>{p.items.map((i) => i.label).join(' · ')}</span>
            </span>
            <span className="option__price">
              {formatMoney(planQuote(p, planSqft).total)}
              <small>per month</small>
            </span>
          </button>
        ))}
      </div>
      {categories.map((cat) => (
        <div key={cat.id}>
          <h3 className="group-title">{cat.label}</h3>
          <div className="option-grid option-grid--2">
            {services
              .filter((s) => s.category === cat.id)
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`option option--service ${selected === s.id ? 'option--active' : ''}`}
                  aria-pressed={selected === s.id}
                  onClick={() => onSelect(s.id)}
                >
                  <span className="option__icon">
                    <s.icon size={22} />
                  </span>
                  <span className="option__body">
                    <strong>
                      {s.name}
                      {s.popular && <em className="badge badge--inline">Popular</em>}
                    </strong>
                    <span>{s.short}</span>
                  </span>
                  <span className="option__price">
                    <Rate service={s} />
                  </span>
                </button>
              ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function Field({
  label,
  error,
  wide,
  optional,
  note,
  children,
}: {
  label: string
  error?: string
  wide?: boolean
  optional?: boolean
  note?: string
  children: ReactNode
}) {
  return (
    <label className={`field ${wide ? 'field--wide' : ''} ${error ? 'field--error' : ''}`}>
      <span>
        {label} {optional && <em className="muted">(optional)</em>}
      </span>
      {children}
      {error ? <small className="field__error">{error}</small> : note && <small className="field__note">{note}</small>}
    </label>
  )
}

function ReviewRow({
  icon,
  label,
  onEdit,
  children,
}: {
  icon: ReactNode
  label: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <div className="review__row">
      <span className="review__icon">{icon}</span>
      <div>
        <small>{label}</small>
        <p>{children}</p>
      </div>
      <button type="button" className="link-btn" onClick={onEdit} aria-label={`Edit ${label.toLowerCase()}`}>
        Edit
      </button>
    </div>
  )
}

const quantityLabel = (q: Quote) =>
  `${formatNumber(q.quantity)} ${q.quantity === 1 ? unitLabels[q.unit].short : unitLabels[q.unit].plural}`

function PriceBreakdown({ q }: { q: Quote }) {
  return (
    <dl className="breakdown">
      <div>
        <dt>
          {quantityLabel(q)} × {formatMoney(q.rate)}
        </dt>
        <dd>{formatMoney(q.base)}</dd>
      </div>
      {q.extrasTotal > 0 && (
        <div>
          <dt>Add-ons</dt>
          <dd>{formatMoney(q.extrasTotal)}</dd>
        </div>
      )}
      {q.discount > 0 && (
        <div className="breakdown__discount">
          <dt>Recurring discount</dt>
          <dd>−{formatMoney(q.discount)}</dd>
        </div>
      )}
      <div className="breakdown__total">
        <dt>
          {q.estimateOnly ? 'Estimate' : 'Total'}
          {q.discount > 0 ? ' per visit' : ''}
        </dt>
        <dd>{formatMoney(q.total)}</dd>
      </div>
      {q.estimateOnly && (
        <p className="breakdown__note">Final price confirmed after a free on-site inspection.</p>
      )}
    </dl>
  )
}

function PlanIncludes({ plan }: { plan: Plan }) {
  return (
    <ul className="plan-includes">
      {plan.items.map((item) => (
        <li key={item.label}>
          <Check size={16} /> {item.label}
        </li>
      ))}
      {plan.perks.map((perk) => (
        <li key={perk} className="plan-includes__perk">
          <Sparkle size={12} /> {perk}
        </li>
      ))}
    </ul>
  )
}

function PlanBreakdown({ pq }: { pq: PlanQuote }) {
  return (
    <dl className="breakdown">
      <div>
        <dt>Included visits, booked separately</dt>
        <dd>{formatMoney(pq.value)}</dd>
      </div>
      <div className="breakdown__discount">
        <dt>Care Plan saving</dt>
        <dd>−{formatMoney(pq.savings)}</dd>
      </div>
      <div className="breakdown__total">
        <dt>Per month</dt>
        <dd>{formatMoney(pq.total)}</dd>
      </div>
      <p className="breakdown__note">
        Pause or cancel anytime. {pq.estimateOnly && 'Final price confirmed at a free home visit.'}
      </p>
    </dl>
  )
}

function PlanSummary({ plan, draft, pq }: { plan: Plan; draft: BookingDraft; pq: PlanQuote }) {
  return (
    <div className="summary">
      <h3>Your subscription</h3>
      <div className="summary__service">
        <span className="option__icon">
          <plan.icon size={20} />
        </span>
        <div>
          <strong>{plan.name} Care Plan</strong>
          <small>{formatNumber(pq.sqft)} sq.ft home</small>
        </div>
      </div>
      <ul className="summary__meta">
        <li>
          <CalendarDays size={16} />
          {draft.date
            ? `First visit ${formatDate(draft.date, { weekday: 'short', month: 'short' })}`
            : 'First visit not scheduled'}
          {draft.time && `, ${formatTime(draft.time)}`}
        </li>
        {plan.items.map((item) => (
          <li key={item.label}>
            <Check size={16} /> {item.label}
          </li>
        ))}
      </ul>
      <PlanBreakdown pq={pq} />
    </div>
  )
}

function Summary({
  service,
  draft,
  frequency,
  extraIds,
  q,
}: {
  service: Service
  draft: BookingDraft
  frequency: FrequencyId
  extraIds: string[]
  q: Quote
}) {
  return (
    <div className="summary">
      <h3>Your booking</h3>
      <div className="summary__service">
        <span className="option__icon">
          <service.icon size={20} />
        </span>
        <div>
          <strong>{service.name}</strong>
          <small>
            {quantityLabel(q)}
            {service.recurring && ` · ${frequencies.find((f) => f.id === frequency)!.name}`}
          </small>
        </div>
      </div>
      <ul className="summary__meta">
        <li>
          <CalendarDays size={16} />
          {draft.date ? formatDate(draft.date, { weekday: 'short', month: 'short' }) : 'Date not selected'}
          {draft.time && `, ${formatTime(draft.time)}`}
        </li>
        <li>
          <Clock size={16} /> ≈ {formatHours(q.hours)}
          {q.team > 1 && ` · team of ${q.team}`}
        </li>
        {extraIds.length > 0 && (
          <li>
            <Check size={16} /> {extraIds.length} add-on{extraIds.length > 1 ? 's' : ''}
          </li>
        )}
      </ul>
      <PriceBreakdown q={q} />
    </div>
  )
}

function Confirmation({
  booking,
  headingRef,
}: {
  booking: Booking
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  const [icsUrl] = useState(() => calendarFileUrl(booking))
  useEffect(() => () => URL.revokeObjectURL(icsUrl), [icsUrl])

  return (
    <div className="booking">
      <div className="container confirmation">
        <div className="confirmation__check">
          <Check size={40} strokeWidth={3} />
          <Sparkle size={22} className="twinkle" style={{ left: -34, top: -6 }} />
          <Sparkle size={14} className="twinkle twinkle--amber" style={{ right: -28, top: -14, animationDelay: '0.5s' }} />
          <Sparkle size={12} className="twinkle" style={{ right: -36, bottom: 6, animationDelay: '1s' }} />
        </div>
        <h1 ref={headingRef} tabIndex={-1}>
          {booking.planQuote ? 'Welcome to Care Plans' : 'You’re booked'}, {booking.contact.name.split(' ')[0]}!
        </h1>
        <p className="lead">
          We’ve received your request{bookingEndpoint ? ` and sent the details to ${booking.contact.email}` : ''}.
          We’ll call to confirm shortly.
        </p>

        <div className="confirmation__card">
          <div className="confirmation__ref">
            <small>{booking.planQuote ? 'Subscription reference' : 'Booking reference'}</small>
            <strong>{booking.reference}</strong>
          </div>
          <ul className="confirmation__details">
            <li>
              {booking.planQuote ? <Repeat size={18} /> : <CircleCheck size={18} />} {booking.serviceName}
            </li>
            <li>
              <CalendarDays size={18} /> {booking.planQuote ? 'First visit ' : ''}
              {formatDate(booking.date!)} at {formatTime(booking.time!)}
            </li>
            <li>
              <MapPin size={18} /> {[booking.contact.address, booking.contact.city].filter(Boolean).join(', ')}
            </li>
            <li>
              <Lock size={18} />{' '}
              {booking.planQuote
                ? `${formatMoney(booking.planQuote.total)} a month — pay monthly, cancel anytime`
                : `${formatMoney(booking.quote!.total)} — pay after the service`}
            </li>
          </ul>
          <a className="btn btn--soft btn--block" href={icsUrl} download={`cleanspace-${booking.reference}.ics`}>
            <CalendarPlus size={18} /> Add to calendar
          </a>
        </div>

        <div className="next-steps">
          <h2>What happens next</h2>
          <ol>
            <li>
              <Mail size={18} />{' '}
              {booking.planQuote
                ? 'We call to confirm your plan, agree your regular schedule and assign your team.'
                : 'We call to confirm your booking and assign your team.'}
            </li>
            <li>
              <Phone size={18} /> You get a reminder the day before your visit.
            </li>
            <li>
              <CircleCheck size={18} /> Our team arrives — sit back and relax.
            </li>
          </ol>
        </div>

        <Link to="/" className="btn btn--ghost">
          <ArrowLeft size={18} /> Back to home
        </Link>
      </div>
    </div>
  )
}
