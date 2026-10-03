import nodemailer from 'nodemailer'
import { TIME_ZONE } from './_google.js'

/** Keep in sync with src/data/config.ts. */
const BUSINESS = {
  name: 'Clean Space',
  phone: '+91 8137980315',
  whatsapp: 'https://wa.me/918137980315',
  site: 'https://www.lijuvp.com/CleanSpace/',
}

export interface BookingEmail {
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

const config = () => ({
  user: process.env.GMAIL_USER,
  pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ''),
  notify: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER,
})

export const mailConfigured = () => {
  const { user, pass } = config()
  return !!(user && pass)
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

function when(b: BookingEmail) {
  const start = new Date(`${b.date}T${b.time}:00+05:30`)
  const date = start.toLocaleDateString('en-IN', {
    timeZone: TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const time = start
    .toLocaleTimeString('en-IN', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase()
  const hours = Math.round(b.durationHours * 2) / 2
  return { date, time, duration: `about ${hours} ${hours === 1 ? 'hour' : 'hours'}` }
}

/** Rows shown in both emails, as [label, value]. */
function rows(b: BookingEmail) {
  const { date, time, duration } = when(b)
  const c = b.contact
  return [
    [b.kind === 'subscription' ? 'Plan' : 'Service', b.serviceName],
    [b.kind === 'subscription' ? 'First visit' : 'When', `${date}, ${time}`],
    ['Duration', duration],
    ['Address', [c.address, c.city, c.zip].filter(Boolean).join(', ')],
    ['Price', b.price],
    ...b.details.map((d) => {
      const i = d.indexOf(': ')
      return i > 0 ? [d.slice(0, i), d.slice(i + 2)] : ['', d]
    }),
    ...(c.notes ? [['Notes', c.notes]] : []),
  ]
}

function layout(title: string, intro: string, table: string[][], outro: string) {
  const htmlRows = table
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#5b6b6b;vertical-align:top;white-space:nowrap">${escape(k)}</td>` +
        `<td style="padding:8px 0;color:#0f2b2b;font-weight:600">${escape(v)}</td></tr>`,
    )
    .join('')
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#f2f7f6;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#1f6f66;color:#fff;border-radius:14px 14px 0 0;padding:20px 24px;font-size:20px;font-weight:700">${BUSINESS.name}</div>
  <div style="background:#fff;border-radius:0 0 14px 14px;padding:24px">
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f2b2b">${escape(title)}</h1>
    <p style="margin:0 0 16px;color:#334;line-height:1.5">${escape(intro)}</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">${htmlRows}</table>
    <p style="margin:20px 0 0;color:#334;line-height:1.5">${escape(outro)}</p>
  </div>
  <p style="text-align:center;color:#7a8a8a;font-size:12px;margin-top:16px">${BUSINESS.name} · <a href="${BUSINESS.whatsapp}" style="color:#1f6f66">WhatsApp ${BUSINESS.phone}</a> · <a href="${BUSINESS.site}" style="color:#1f6f66">${BUSINESS.site.replace('https://', '')}</a></p>
</div></body></html>`
  const text = [title, '', intro, '', ...table.map(([k, v]) => (k ? `${k}: ${v}` : v)), '', outro, '', `${BUSINESS.name} · WhatsApp ${BUSINESS.phone}: ${BUSINESS.whatsapp}`].join('\n')
  return { html, text }
}

export async function sendBookingEmails(b: BookingEmail) {
  const { user, pass, notify } = config()
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  const from = `"${BUSINESS.name}" <${user}>`
  const { date, time } = when(b)
  const firstName = b.contact.name.split(' ')[0]
  const table = rows(b)
  const isPlan = b.kind === 'subscription'

  const customer = layout(
    isPlan ? `Welcome to Care Plans, ${firstName}!` : `Thanks for booking, ${firstName}!`,
    isPlan
      ? `We've received your ${b.serviceName} subscription. Your first visit is on ${date} at ${time}. We'll call you shortly to agree your regular schedule.`
      : `We've received your booking for ${date} at ${time}. We'll call you shortly to confirm.`,
    [['Reference', b.reference], ...table],
    `Need to change something? Reply to this email or WhatsApp us on ${BUSINESS.phone}. Free cancellation up to 24 hours before your visit.`,
  )
  const owner = layout(
    `New ${b.kind}: ${b.serviceName}`,
    `${b.contact.name} booked ${date} at ${time}. Reply to this email to contact them.`,
    [['Reference', b.reference], ['Customer', b.contact.name], ['Phone', b.contact.phone], ['Email', b.contact.email], ...table],
    'A confirmation email has been sent to the customer.',
  )

  await Promise.all([
    transport.sendMail({
      from,
      to: b.contact.email,
      replyTo: notify,
      subject: `${isPlan ? 'Your Care Plan' : 'Your booking'} ${b.reference}: ${b.serviceName}, ${date} at ${time}`,
      ...customer,
    }),
    transport.sendMail({
      from,
      to: notify,
      replyTo: b.contact.email,
      subject: `New ${b.kind} ${b.reference}: ${b.serviceName}, ${date} at ${time} (${b.contact.name})`,
      ...owner,
    }),
  ])
}
