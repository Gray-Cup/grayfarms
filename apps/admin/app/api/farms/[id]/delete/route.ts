import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { deleteFarm, deleteFarmPullRequest } from '@/lib/github'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { farmType, farmName, mode } = await req.json()

  try {
    if (mode === 'pr') {
      const prUrl = await deleteFarmPullRequest(farmType, id, farmName)
      return NextResponse.json({ ok: true, pr_url: prUrl })
    } else {
      await deleteFarm(farmType, id, farmName)
      return NextResponse.json({ ok: true })
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 }
    )
  }
}
