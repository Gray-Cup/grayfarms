import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { farmType, phone, email } = await req.json()

  const db = createSupabaseServiceClient()
  const { error } = await db.from('farm_contacts').upsert(
    { farm_id: id, farm_type: farmType, phone: phone ?? null, email: email ?? null },
    { onConflict: 'farm_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
