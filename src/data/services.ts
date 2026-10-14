import type { LucideIcon } from 'lucide-react'
import {
  AppWindow,
  Armchair,
  Bug,
  BugOff,
  Building,
  Building2,
  CookingPot,
  Droplets,
  Fence,
  Grid2x2,
  Grid3x3,
  HardHat,
  House,
  Microwave,
  PaintRoller,
  Recycle,
  Refrigerator,
  Sparkles,
  Truck,
} from 'lucide-react'

export type ServiceId =
  | 'deep'
  | 'renovated'
  | 'construction'
  | 'regular'
  | 'move'
  | 'sofa'
  | 'carpet'
  | 'pest'
  | 'termite'
  | 'glass'
  | 'tank'
  | 'interlock'
  | 'waste'
  | 'office'

export type Category = 'home' | 'furnishing' | 'pest' | 'specialised' | 'business'
export type Unit = 'sqft' | 'seat' | 'litre' | 'kg'

export const categories: { id: Category; label: string }[] = [
  { id: 'home', label: 'Home cleaning' },
  { id: 'furnishing', label: 'Sofa & carpet' },
  { id: 'pest', label: 'Pest control' },
  { id: 'specialised', label: 'Glass, tank & outdoor' },
  { id: 'business', label: 'Office & commercial' },
]

export const unitLabels: Record<Unit, { short: string; plural: string }> = {
  sqft: { short: 'sq.ft', plural: 'sq.ft' },
  seat: { short: 'seat', plural: 'seats' },
  litre: { short: 'litre', plural: 'litres' },
  kg: { short: 'kg', plural: 'kg' },
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
  /** Shown as "up to" — the rate is a ceiling, final price is confirmed after inspection. */
  upTo?: boolean
  /** Jobs smaller than this are charged as this quantity. */
  minQuantity?: number
  /** Wording for the size step when it isn't an area in sq.ft. */
  size?: { question: string; title: string; label: string }
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
    short: 'Intensive top-to-bottom clean of every room in a lived-in home.',
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
    rate: 5,
    fromPrice: true,
    minutesPerUnit: 0.4,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'renovated',
    name: 'Renovated House Cleaning',
    category: 'home',
    icon: PaintRoller,
    short: 'Heavy stains and renovation dust cleared after the work is done.',
    description:
      'A heavy-duty deep clean after painting, tiling or carpentry work — stubborn stains, putty and fine dust removed from every surface so the house is ready to live in again.',
    includes: [
      'Everything in Deep Cleaning',
      'Paint, putty & cement stain removal',
      'Fine dust from walls, ledges & fittings',
      'Inside cabinets, wardrobes & lofts',
      'Windows, frames & sliding tracks',
      'Floor scrubbing (x2)',
    ],
    idealFor: 'Homes after painting, tiling or interior work',
    recurring: false,
    unit: 'sqft',
    rate: 7,
    fromPrice: true,
    minutesPerUnit: 0.5,
    range: homeRange,
    bhkPresets: true,
  },
  {
    id: 'construction',
    name: 'New House / Post-Construction',
    category: 'home',
    icon: HardHat,
    short: 'Get a newly built home spotless and ready to move in.',
    description:
      'The deepest clean we do: construction dust, cement, paint and debris removed from every surface, fixture and floor of a new or newly built house.',
    includes: [
      'Construction dust removal from all surfaces',
      'Cement, paint & grout haze removal',
      'Fixtures, fittings, switches & vents',
      'Windows, glass, frames & tracks',
      'Floor scrubbing & polishing (x2)',
      'Debris bagged & removed',
    ],
    idealFor: 'New homes before move-in, after construction',
    recurring: false,
    unit: 'sqft',
    rate: 9,
    fromPrice: true,
    minutesPerUnit: 0.55,
    range: { min: 300, max: 20000, step: 100, default: 1000 },
    bhkPresets: true,
  },
  {
    id: 'regular',
    name: 'Normal Home Cleaning',
    category: 'home',
    icon: House,
    short: 'Routine brushing, mopping and vacuuming to keep your home fresh.',
    description:
      'A lighter, recurring clean focused on the essentials: brushing, mopping and vacuuming, plus kitchen surfaces and bathrooms. Charged for a minimum of 1,000 sq.ft per visit.',
    includes: [
      'Brushing & sweeping of all floors',
      'Mopping of all floors',
      'Vacuuming of floors, mats & corners',
      'Dusting of all reachable surfaces',
      'Kitchen slab, sink & stove top',
      'Bathrooms cleaned & disinfected',
    ],
    idealFor: 'Weekly or fortnightly upkeep',
    recurring: true,
    unit: 'sqft',
    rate: 3,
    minQuantity: 1000,
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
    short: 'Odourless treatment for cockroaches, ants, spiders and other pests.',
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
    id: 'glass',
    name: 'Glass & Height Cleaning',
    category: 'specialised',
    icon: Building2,
    short: 'External and high-rise windows and glass walls, cleaned safely.',
    description:
      'External and high-rise glass window and glass wall cleaning, using ladders, poles and safety harnesses for work at height.',
    includes: [
      'External windows & glass walls',
      'Work at height with safety harness',
      'Hard-water & bird-dropping stain removal',
      'Frames, tracks & sills wiped',
      'Streak-free squeegee finish',
      'Site safety check before work',
    ],
    idealFor: 'Apartments, villas, shopfronts & offices',
    recurring: false,
    unit: 'sqft',
    rate: 8,
    upTo: true,
    minutesPerUnit: 0.4,
    range: { min: 50, max: 5000, step: 10, default: 300 },
    size: { question: 'How much glass?', title: 'Glass area', label: 'Glass area to be cleaned' },
  },
  {
    id: 'tank',
    name: 'Water Tank Cleaning',
    category: 'specialised',
    icon: Droplets,
    short: 'Overhead and underground tanks drained, scrubbed and disinfected.',
    description:
      'Overhead and underground water tank cleaning: drained, desludged, scrubbed and disinfected. Booking a deep clean too? The tank is ₹1–₹1.25 per litre as part of the package — mention it in your booking notes.',
    includes: [
      'Water drained & sludge removed',
      'Walls & floor scrubbed',
      'High-pressure rinse',
      'Disinfection with safe, approved agents',
      'Inlet, outlet & lid cleaned',
      'Ready-to-refill inspection',
    ],
    idealFor: 'Overhead tanks, underground sumps',
    recurring: false,
    unit: 'litre',
    rate: 1.5,
    minutesPerUnit: 0.08,
    range: { min: 500, max: 20000, step: 500, default: 1000 },
    size: { question: 'How big is the tank?', title: 'Tank', label: 'Tank capacity' },
  },
  {
    id: 'interlock',
    name: 'Interlock & Paver Cleaning',
    category: 'specialised',
    icon: Grid3x3,
    short: 'High-pressure washing for driveways, courtyards and paths.',
    description:
      'Outdoor high-pressure washing of interlock and paver blocks to lift moss, algae, oil and monsoon grime. Larger areas get a lower rate per square foot.',
    includes: [
      'High-pressure washing',
      'Moss, algae & fungus removal',
      'Oil & tyre-mark treatment',
      'Joints & edges cleaned',
      'Drain channels cleared',
      'Debris swept & removed',
    ],
    idealFor: 'Driveways, courtyards, walkways & parking',
    recurring: false,
    unit: 'sqft',
    rate: 5,
    tiers: [
      { upTo: 1000, rate: 8 },
      { upTo: Infinity, rate: 5 },
    ],
    fromPrice: true,
    minutesPerUnit: 0.12,
    range: { min: 100, max: 20000, step: 50, default: 1000 },
    size: { question: 'How big is the paved area?', title: 'Area', label: 'Paved area' },
  },
  {
    id: 'waste',
    name: 'Waste Removal',
    category: 'specialised',
    icon: Recycle,
    short: 'Household waste and junk collected and disposed of responsibly.',
    description:
      'Household waste and junk collected from your home, segregated and disposed of responsibly. Bigger loads get a lower rate per kg. Shifting assistance is available on request.',
    includes: [
      'Collection from your home',
      'Segregation for recycling',
      'Responsible disposal',
      'Bulky items & old furniture',
      'Loft, garage & store-room clear-outs',
      'Shifting assistance on request',
    ],
    idealFor: 'Clear-outs, moving house, after renovation',
    recurring: false,
    unit: 'kg',
    rate: 15,
    tiers: [
      { upTo: 100, rate: 15 },
      { upTo: 500, rate: 8 },
      { upTo: Infinity, rate: 5 },
    ],
    fromPrice: true,
    minutesPerUnit: 0.5,
    range: { min: 10, max: 2000, step: 10, default: 50 },
    size: { question: 'How much waste?', title: 'Waste', label: 'Approximate weight' },
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
