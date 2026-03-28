import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import type { Submission } from '@farms/db'

interface Props {
  searchParams: Promise<{ status?: string }>
}

const STATUS_OPTIONS = ['pending', 'pr_created', 'approved', 'rejected']

export default async function SubmissionsPage({ searchParams }: Props) {
  const { status } = await searchParams
  const supabase = createSupabaseServiceClient()

  let query = supabase
    .from('submissions')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (status && STATUS_OPTIONS.includes(status)) {
    query = query.eq('status', status)
  }

  const { data: submissions, error } = await query

  if (error) {
    return <div className="alert alert-error">Failed to load submissions: {error.message}</div>
  }

  const rows = (submissions ?? []) as Submission[]

  return (
    <>
      <h2>Submissions</h2>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <Link href="/submissions"
          className={`btn${!status ? ' btn-primary' : ''}`}>
          All ({rows.length})
        </Link>
        {STATUS_OPTIONS.map(s => (
          <Link key={s} href={`/submissions?status=${s}`}
            className={`btn${status === s ? ' btn-primary' : ''}`}
            style={{ textTransform: 'capitalize' }}>
            {s.replace('_', ' ')}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-small)' }}>
          No submissions found.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Farm</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Submitted</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(sub => (
              <tr key={sub.id}>
                <td>{sub.name}</td>
                <td><span className="type-badge">{sub.farm_type}</span></td>
                <td>{sub.city}, {sub.state}</td>
                <td>
                  <span className={`status-badge status-${sub.status}`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ color: 'var(--color-muted)' }}>
                  {new Date(sub.submitted_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>
                <td>
                  <Link href={`/submissions/${sub.id}`} className="btn">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
