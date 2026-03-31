import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@farms/db'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

export async function POST(req: NextRequest) {
  if (!TURNSTILE_SECRET) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  let farmId: string, token: string
  try {
    const body = await req.json()
    farmId = body.farmId
    token = body.token
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!farmId || !token) {
    return NextResponse.json({ error: 'Missing farmId or token' }, { status: 400 })
  }

  // Verify Turnstile token with Cloudflare
  const formData = new FormData()
  formData.append('secret', TURNSTILE_SECRET)
  formData.append('response', token)
  formData.append('remoteip', req.headers.get('cf-connecting-ip') ?? '')

  const verifyRes = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: formData }
  )
  const verifyData = await verifyRes.json() as { success: boolean }

  if (!verifyData.success) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
  }

  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from('farm_contacts')
    .select('phone, email')
    .eq('farm_id', farmId)
    .single()

  return NextResponse.json({
    phone: data?.phone ?? null,
    email: data?.email ?? null,
  })
}
