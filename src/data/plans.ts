import type { LucideIcon } from 'lucide-react'
import { Crown, Gem, Sparkles } from 'lucide-react'
import type { ServiceId } from './services'

export type PlanId = 'essential' | 'plus' | 'premium'

export interface PlanItem {
  serviceId: ServiceId
  /** Visits per year; the monthly price spreads them evenly. */
  perYear: number
  label: string
  /** Fixed quantity for per-seat services (e.g. sofa seats). */
  seats?: number
}

export interface Plan {
  id: PlanId
  name: string
  icon: LucideIcon
  tagline: string
  /** Discount on the combined one-time price of everything included. */
  discount: number
  items: PlanItem[]
  perks: string[]
  popular?: boolean
}

export const plans: Plan[] = [
  {
    id: 'essential',
    name: 'Essential',
    icon: Sparkles,
    tagline: 'Keep things fresh between busy weeks.',
    discount: 0.18,
    items: [
      { serviceId: 'regular', perYear: 24, label: '2 regular cleans a month' },
      { serviceId: 'deep', perYear: 1, label: '1 deep clean a year' },
    ],
    perks: ['Same trusted team every visit', 'Free rescheduling', '10% off other services'],
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: Gem,
    tagline: 'Our most loved plan for family homes.',
    discount: 0.22,
    popular: true,
    items: [
      { serviceId: 'regular', perYear: 48, label: 'Weekly regular clean (4 a month)' },
      { serviceId: 'deep', perYear: 2, label: 'Deep clean every 6 months' },
      { serviceId: 'pest', perYear: 4, label: 'Pest control every 3 months' },
    ],
    perks: ['Same trusted team every visit', 'Priority time slots', '15% off other services'],
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    tagline: 'Total care for larger homes and villas.',
    discount: 0.25,
    items: [
      { serviceId: 'regular', perYear: 96, label: 'Regular clean twice a week' },
      { serviceId: 'deep', perYear: 4, label: 'Deep clean every 3 months' },
      { serviceId: 'pest', perYear: 4, label: 'Pest control every 3 months' },
      { serviceId: 'sofa', perYear: 2, seats: 5, label: 'Sofa shampoo twice a year (5 seats)' },
    ],
    perks: ['Dedicated supervisor', 'Free yearly termite inspection', '20% off other services'],
  },
]

export const getPlan = (id: string | null | undefined) => plans.find((p) => p.id === id)

export const maxPlanDiscount = Math.max(...plans.map((p) => p.discount))
