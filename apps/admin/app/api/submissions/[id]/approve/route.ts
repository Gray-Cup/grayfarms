import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import { createFarmPullRequest } from '@/lib/github'
import type { Submission } from '@farms/db'

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  // Verify admin is authenticated
  const supabaseAuth = await createSupabaseServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const reviewerNotes = body.reviewer_notes?.trim() ?? null

  const supabase = createSupabaseServiceClient()

  // Fetch the submission
  const { data, error: fetchError } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !data) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const submission = data as Submission

  try {
    // Create the GitHub pull request
    const prUrl = await createFarmPullRequest(submission)

    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'pr_created',
        github_pr_url: prUrl,
        reviewer_notes: reviewerNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update submission after PR creation:', updateError)
      // PR was created, return its URL even if the DB update failed
    }

    return NextResponse.json({ ok: true, pr_url: prUrl })
  } catch (err) {
    console.error('PR creation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create PR' },
      { status: 500 }
    )
  }
}
