// Central place for business details. Edit these before going live.
export const business = {
  name: 'Clean Space',
  tagline: 'Spotless spaces. Zero hassle.',
  phone: '+91 7559049070',
  email: 'hello@cleanspace.in',
  city: 'Kozhikode',
  state: 'Kerala',
  serviceArea: 'Kozhikode (Calicut) & nearby areas, Kerala',
  /** Localities listed in the FAQ. */
  areas: ['Kozhikode city', 'Feroke', 'Ramanattukara', 'Kunnamangalam', 'Mavoor', 'Balussery', 'Koyilandy'],
  /** PIN codes in Kozhikode district start with this prefix. */
  pinPrefix: '673',
  hours: 'Mon – Sat, 8:00 AM – 7:00 PM',
  currency: 'INR',
  locale: 'en-IN',
  /** Minimum notice in days before a booking can be made. */
  minNoticeDays: 1,
  /** How many days ahead customers can book. */
  bookingWindowDays: 60,
  /** Days of week that are closed (0 = Sunday). */
  closedWeekdays: [0] as number[],
}

/**
 * Optional: where booking requests are POSTed as JSON.
 * Works out of the box with Formspree (https://formspree.io), Getform,
 * a Google Apps Script web app, or your own API.
 * Set VITE_BOOKING_ENDPOINT in a .env file. When empty, bookings are
 * stored in the visitor's browser only (handy for demos).
 */
export const bookingEndpoint: string = import.meta.env.VITE_BOOKING_ENDPOINT ?? ''
