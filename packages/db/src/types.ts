export interface CoffeeFarm {
  id: string
  name: string
  state: string
  city: string
  address: string | null
  pincode: string | null
  lat: number | null
  lng: number | null
  url: string | null
  description: string | null
  elevation_meters: number | null
  varieties: string[]
  processing_methods: string[]
  certifications: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export interface TeaFarm {
  id: string
  name: string
  state: string
  city: string
  address: string | null
  pincode: string | null
  lat: number | null
  lng: number | null
  url: string | null
  description: string | null
  elevation_meters: number | null
  tea_types: string[]
  processing_methods: string[]
  certifications: string[]
  active: boolean
  created_at: string
  updated_at: string
}

export type FarmType = 'coffee' | 'tea'

export interface Submission {
  id: string
  farm_type: FarmType
  name: string
  state: string
  city: string
  address: string | null
  pincode: string | null
  url: string | null
  description: string | null
  lat: number | null
  lng: number | null
  elevation_meters: number | null
  varieties: string[]
  processing_methods: string[]
  certifications: string[]
  tea_types: string[]
  submitter_name: string | null
  submitter_email: string | null
  submitter_notes: string | null
  status: 'pending' | 'approved' | 'rejected' | 'pr_created'
  github_pr_url: string | null
  github_branch: string | null
  reviewer_notes: string | null
  submitted_at: string
  reviewed_at: string | null
}

// Data-file shapes (what lives in data/coffee-farms.json etc.)
// Contact info (phone/email) is stored in Supabase farm_contacts, not in JSON.
export interface CoffeeFarmData {
  id: string
  name: string
  state: string
  city: string
  address: string | null
  pincode: string | null
  lat: number | null
  lng: number | null
  url: string | null
  description: string | null
  elevation_meters: number | null
  varieties: string[]
  processing_methods: string[]
  certifications: string[]
  active: boolean
}

export interface TeaFarmData {
  id: string
  name: string
  state: string
  city: string
  address: string | null
  pincode: string | null
  lat: number | null
  lng: number | null
  url: string | null
  description: string | null
  elevation_meters: number | null
  tea_types: string[]
  processing_methods: string[]
  certifications: string[]
  active: boolean
}

export interface FarmContact {
  farm_id: string
  farm_type: FarmType
  phone: string | null
  email: string | null
  updated_at: string
}
