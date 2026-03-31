import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@farms/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      farm_type, name, state, city, address, pincode, url, description,
      lat, lng, elevation_meters, varieties, tea_types, processing_methods, certifications,
      submitter_name, submitter_email, submitter_notes,
    } = body

    if (!farm_type || !name || !state || !city) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!['coffee', 'tea'].includes(farm_type)) {
      return NextResponse.json({ error: 'Invalid farm_type' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { error } = await supabase.from('submissions').insert({
      farm_type,
      name: name.trim(),
      state: state.trim(),
      city: city.trim(),
      address: address?.trim() || null,
      pincode: pincode?.trim() || null,
      url: url?.trim() || null,
      description: description?.trim() || null,
      lat: lat ?? null,
      lng: lng ?? null,
      elevation_meters: elevation_meters ?? null,
      varieties: varieties ?? [],
      tea_types: tea_types ?? [],
      processing_methods: processing_methods ?? [],
      certifications: certifications ?? [],
      submitter_name: submitter_name?.trim() || null,
      submitter_email: submitter_email?.trim() || null,
      submitter_notes: submitter_notes?.trim() || null,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Submit route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
