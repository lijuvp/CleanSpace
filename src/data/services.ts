import type { LucideIcon } from 'lucide-react'
import {
  AppWindow,
  Armchair,
  Bug,
  BugOff,
  Building,
  CookingPot,
  Fence,
  Grid2x2,
  HardHat,
  House,
  Microwave,
  Refrigerator,
  Sparkles,
  Truck,
} from 'lucide-react'

export type ServiceId =
  | 'deep'
  | 'regular'
  | 'move'
  | 'sofa'
  | 'carpet'
  | 'pest'
  | 'termite'
  | 'office'
  | 'construction'

export type Category = 'home' | 'furnishing' | 'pest' | 'business'
export type Unit = 'sqft' | 'seat'

export const categories: { id: Category; label: string }[] = [
  { id: 'home', label: 'Home cleaning' },
  { id: 'furnishing', label: 'Sofa & carpet' },
  { id: 'pest', label: 'Pest control' },
  { id: 'business', label: 'Office & commercial' },
]

export const unitLabels: Record<Unit, { short: string; plural: string }> = {
  sqft: { short: 'sq.ft', plural: 'sq.ft' },
  seat: { short: 'seat', plural: 'seats' },
}

export interface Service {
  id: ServiceId
  name: string
  category: Category
  icon: LucideIcon
  short: string
  description: string
  includes: string[]
  idealFor: string
  popular?: boolean
  /** Whether recurring discounts are offered for this service. */
  recurring: boolean
  unit: Unit
  /** Price per unit in INR. */
  rate: number
  /** Volume pricing: the whole job is charged at the rate of the bracket it falls in. */
  tiers?: { upTo: number; rate: number }[]
  /** Shown as "from" — final price is confirmed after inspection. */
  fromPrice?: boolean
  /** Labour minutes per unit, used for the time estimate. */
  minutesPerUnit: number
  range: { min: number; max: number; step: number; default: number }
  /** Offer BHK quick-pick sizes. */
  bhkPresets?: boolean
}

const homeRange = { min: 300, max: 6000, step: 50, default: 1000 }

export const services: Service[] = [
  {
    id: 'deep',
    name: 'Deep Cleaning',
    category: 'home',
    icon: Sparkles,
    short: 'Intensive top-to-bottom clean of every room, corner and surface.',
    description:
      'A complete, detailed clean of your home: kitchen degreasing, bathroom descaling, fans, windows, grills and every hard-to-reach corner.',
    includes: [
      'Kitchen degreasing — tiles, slab, sink & exteriors',
      'Bathroom descaling & disinfection',
      'Fans, lights & switchboards wiped',
      'Windows, grills & doors cleaned',
      'Cobweb removal & dusting of all surfaces',
      'Floor scrubbing & mopping',
    ],
    idealFor: 'Festivals, first-time cleans, seasonal resets',
    popular: true,
    recurring: false,
    unit: 'sqft',
    rate: 6,
    minutesPerUnit: 0.4,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'regular',
    name: 'Regular Home Cleaning',
    category: 'home',
    icon: House,
    short: 'Routine upkeep that keeps your home fresh week after week.',
    description:
      'A lighter, recurring clean focused on the essentials: dusting, floors, kitchen surfaces and bathrooms.',
    includes: [
      'Dusting of all reachable surfaces',
      'Sweeping & mopping all floors',
      'Kitchen slab, sink & stove top',
      'Bathrooms cleaned & disinfected',
      'Mirrors & glass polished',
      'Trash emptied',
    ],
    idealFor: 'Weekly or fortnightly upkeep',
    recurring: true,
    unit: 'sqft',
    rate: 3,
    minutesPerUnit: 0.15,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'move',
    name: 'Move In / Move Out',
    category: 'home',
    icon: Truck,
    short: 'Hand over — or move into — a spotless, empty home.',
    description:
      'An empty-home deep clean to get your deposit back or start fresh, including inside cabinets, wardrobes and appliances.',
    includes: [
      'Everything in Deep Cleaning',
      'Inside kitchen cabinets & drawers',
      'Inside wardrobes & lofts',
      'Paint & cement spot removal',
      'Balcony & utility area',
      'Final walkthrough checklist',
    ],
    idealFor: 'Tenants, landlords & new homeowners',
    recurring: false,
    unit: 'sqft',
    rate: 7,
    minutesPerUnit: 0.45,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'sofa',
    name: 'Sofa Shampoo Cleaning',
    category: 'furnishing',
    icon: Armchair,
    short: 'Deep shampoo & extraction that lifts stains, dust and odours.',
    description:
      'Fabric-safe shampooing with wet extraction to remove embedded dirt, stains and allergens from your sofa.',
    includes: [
      'Dry vacuuming of seats & crevices',
      'Fabric-safe shampoo application',
      'Spot treatment of stains',
      'Wet extraction of dirt & moisture',
      'Deodorising finish',
      'Cushions & armrests included',
    ],
    idealFor: 'Fabric sofas, recliners & dining chairs',
    recurring: false,
    unit: 'seat',
    rate: 500,
    minutesPerUnit: 30,
    range: { min: 1, max: 15, step: 1, default: 5 },
  },
  {
    id: 'carpet',
    name: 'Carpet Shampoo Cleaning',
    category: 'furnishing',
    icon: Grid2x2,
    short: 'Revive carpets and rugs with deep shampoo & extraction.',
    description:
      'Machine shampooing and extraction for carpets and rugs. Larger areas get a lower rate per square foot.',
    includes: [
      'Dry vacuuming to lift loose dirt',
      'Pre-treatment of stains',
      'Machine shampoo scrub',
      'Hot-water extraction',
      'Pile grooming for even drying',
      'Deodorising finish',
    ],
    idealFor: 'Carpets, rugs & wall-to-wall carpeting',
    recurring: false,
    unit: 'sqft',
    rate: 7,
    tiers: [
      { upTo: 100, rate: 10 },
      { upTo: 200, rate: 9 },
      { upTo: 400, rate: 8 },
      { upTo: Infinity, rate: 7 },
    ],
    minutesPerUnit: 0.6,
    range: { min: 20, max: 2000, step: 10, default: 100 },
  },
  {
    id: 'pest',
    name: 'Pest Control',
    category: 'pest',
    icon: BugOff,
    short: 'Odourless treatment for cockroaches, ants, spiders and more.',
    description:
      'General pest control using approved, low-odour treatments for kitchens, bathrooms and living areas.',
    includes: [
      'Inspection of infested areas',
      'Gel treatment for cockroaches',
      'Spray for ants, spiders & silverfish',
      'Kitchen & bathroom drains treated',
      'Safety advice for kids & pets',
      'Follow-up visit if needed',
    ],
    idealFor: 'Homes, offices, shops & restaurants',
    recurring: false,
    unit: 'sqft',
    rate: 2,
    fromPrice: true,
    minutesPerUnit: 0.04,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'termite',
    name: 'Termite Control',
    category: 'pest',
    icon: Bug,
    short: 'Protect your furniture and structure from termite damage.',
    description:
      'Drill-fill-seal anti-termite treatment along walls, woodwork and entry points to eliminate colonies and prevent return.',
    includes: [
      'Detailed termite inspection',
      'Drilling along wall-floor junctions',
      'Chemical injection & sealing',
      'Woodwork & furniture treatment',
      'Entry-point barrier',
      'Service warranty card',
    ],
    idealFor: 'Homes & offices with wooden fittings',
    recurring: false,
    unit: 'sqft',
    rate: 12,
    fromPrice: true,
    minutesPerUnit: 0.12,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'office',
    name: 'Office & Commercial',
    category: 'business',
    icon: Building,
    short: 'A cleaner, healthier workplace your team will notice.',
    description:
      'Flexible daytime or after-hours cleaning for offices, clinics and shops: desks, pantry, washrooms and high-touch disinfection.',
    includes: [
      'Desks & workstations wiped',
      'High-touch disinfection (handles, switches)',
      'Pantry / break room clean',
      'Washrooms sanitised',
      'Floors vacuumed & mopped',
      'Meeting rooms reset',
    ],
    idealFor: 'Offices, studios, clinics & retail',
    recurring: true,
    unit: 'sqft',
    rate: 4,
    minutesPerUnit: 0.1,
    range: { min: 300, max: 20000, step: 100, default: 1500 },
  },
  {
    id: 'construction',
    name: 'Post-Renovation',
    category: 'business',
    icon: HardHat,
    short: 'Clear the dust and debris after builders leave.',
    description:
      'Heavy-duty clean after construction or renovation — fine dust, paint and cement removal from every surface, fixture and floor.',
    includes: [
      'Fine dust removal from all surfaces',
      'Paint & cement stain removal',
      'Fixtures, fittings & vents',
      'Windows, frames & tracks',
      'Floor scrubbing (x2)',
      'Debris bagged & removed',
    ],
    idealFor: 'Homes & commercial units after works',
    recurring: false,
    unit: 'sqft',
    rate: 10,
    minutesPerUnit: 0.5,
    range: { min: 300, max: 20000, step: 100, default: 1000 },
    bhkPresets: true,
  },
]

export const bhkPresets = [
  { label: '1 BHK', sqft: 600 },
  { label: '2 BHK', sqft: 1000 },
  { label: '3 BHK', sqft: 1500 },
  { label: '4 BHK', sqft: 2200 },
  { label: 'Villa', sqft: 3500 },
]

export interface Extra {
  id: string
  name: string
  price: number
  icon: LucideIcon
  /** Extra minutes of work. */
  minutes: number
  categories: Category[]
}

export const extras: Extra[] = [
  { id: 'fridge', name: 'Inside fridge', price: 300, minutes: 30, icon: Refrigerator, categories: ['home'] },
  { id: 'microwave', name: 'Inside oven / microwave', price: 250, minutes: 25, icon: Microwave, categories: ['home', 'business'] },
  { id: 'chimney', name: 'Chimney degreasing', price: 700, minutes: 45, icon: CookingPot, categories: ['home'] },
  { id: 'windows', name: 'Extra windows & grills', price: 500, minutes: 45, icon: AppWindow, categories: ['home', 'business'] },
  { id: 'balcony', name: 'Balcony & terrace', price: 400, minutes: 40, icon: Fence, categories: ['home'] },
]

export type FrequencyId = 'once' | 'weekly' | 'biweekly' | 'monthly'

export const frequencies: { id: FrequencyId; name: string; discount: number; note: string }[] = [
  { id: 'once', name: 'One-time', discount: 0, note: 'Single visit' },
  { id: 'weekly', name: 'Weekly', discount: 0.2, note: 'Save 20%' },
  { id: 'biweekly', name: 'Every 2 weeks', discount: 0.15, note: 'Save 15%' },
  { id: 'monthly', name: 'Monthly', discount: 0.1, note: 'Save 10%' },
]

export const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00']

export const getService = (id: string | null | undefined) => services.find((s) => s.id === id)
