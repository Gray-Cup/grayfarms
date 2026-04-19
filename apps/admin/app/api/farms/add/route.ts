import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyToken } from '@/lib/session'
import { addFarm } from '@/lib/github'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { farmType, farm, contact } = await req.json() as {
    farmType: 'coffee' | 'tea'
    farm: CoffeeFarmData | TeaFarmData
    contact: { phone: string | null; email: string | null }
  }

  try {
    await addFarm(farmType, farm)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to commit farm' },
      { status: 500 }
    )
  }

  if (contact.phone || contact.email) {
    const db = createSupabaseServiceClient()
    const { error } = await db.from('farm_contacts').upsert(
      { farm_id: farm.id, farm_type: farmType, phone: contact.phone ?? null, email: contact.email ?? null },
      { onConflict: 'farm_id' }
    )
    if (error) {
      return NextResponse.json(
        { error: `Farm committed but contact save failed: ${error.message}` },
        { status: 207 }
      )
    }
  }

  return NextResponse.json({ ok: true, id: farm.id })
}
