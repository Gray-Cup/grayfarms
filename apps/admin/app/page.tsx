import Link from 'next/link'
import { createSupabaseServiceClient } from '@/lib/supabase-server'

async function getStats() {
  const supabase = createSupabaseServiceClient()

  const [pendingRes, approvedRes, rejectedRes, prRes] = await Promise.all([
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pr_created'),
  ])

  return {
    pending:    pendingRes.count ?? 0,
    approved:   approvedRes.count ?? 0,
    rejected:   rejectedRes.count ?? 0,
    pr_created: prRes.count ?? 0,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <>
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{stats.pending}</div>
          <div className="stat-label">Pending review</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.pr_created}</div>
          <div className="stat-label">PR open on GitHub</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.rejected}</div>
          <div className="stat-label">Rejected</div>
        </div>
      </div>

      {stats.pending > 0 && (
        <p style={{ fontSize: 'var(--text-small)', marginBottom: '1rem' }}>
          You have <strong>{stats.pending}</strong> submission{stats.pending > 1 ? 's' : ''} waiting for review.{' '}
          <Link href="/submissions?status=pending">Review now →</Link>
        </p>
      )}

      <h3>Quick links</h3>
      <ul style={{ fontSize: 'var(--text-small)', paddingLeft: '1.2rem', lineHeight: 2 }}>
        <li><Link href="/submissions">All submissions</Link></li>
        <li><Link href="/submissions?status=pending">Pending submissions</Link></li>
        <li>
          <a href={`https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`}
            target="_blank" rel="noopener noreferrer">
            Open PRs on GitHub →
          </a>
        </li>
      </ul>
    </>
  )
}
