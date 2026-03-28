import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import type { Submission } from '@farms/db'
import SubmissionActions from '@/components/SubmissionActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = createSupabaseServiceClient()

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const sub = data as Submission

  const tags =
    sub.farm_type === 'coffee'
      ? [...sub.varieties, ...sub.certifications]
      : [...sub.tea_types, ...sub.certifications]

  return (
    <>
      <div className="breadcrumb">
        <Link href="/submissions">Submissions</Link> / {sub.name}
      </div>

      <h2>{sub.name}</h2>

      <div style={{ marginBottom: '0.75rem' }}>
        <span className="type-badge" style={{ marginRight: '0.5rem' }}>{sub.farm_type}</span>
        <span className={`status-badge status-${sub.status}`}>
          {sub.status.replace('_', ' ')}
        </span>
      </div>

      {sub.github_pr_url && (
        <div className="alert alert-success">
          PR created:{' '}
          <a href={sub.github_pr_url} target="_blank" rel="noopener noreferrer">
            {sub.github_pr_url}
          </a>
        </div>
      )}

      <dl className="detail-grid">
        <dt>State</dt>       <dd>{sub.state}</dd>
        <dt>City</dt>        <dd>{sub.city}</dd>
        {sub.address && <><dt>Address</dt><dd>{sub.address}</dd></>}
        {sub.pincode && <><dt>Pincode</dt><dd>{sub.pincode}</dd></>}
        {sub.lat != null && (
          <>
            <dt>Coordinates</dt>
            <dd>
              {sub.lat}, {sub.lng}{' '}
              <a
                href={`https://www.openstreetmap.org/?mlat=${sub.lat}&mlon=${sub.lng}&zoom=14`}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 'var(--text-xsmall)' }}
              >
                View on OSM →
              </a>
            </dd>
          </>
        )}
        {sub.elevation_meters && <><dt>Elevation</dt><dd>{sub.elevation_meters}m</dd></>}
        {sub.url && <><dt>Website</dt><dd><a href={sub.url} target="_blank" rel="noopener noreferrer">{sub.url}</a></dd></>}
        {sub.description && <><dt>Description</dt><dd>{sub.description}</dd></>}

        {tags.length > 0 && (
          <>
            <dt>{sub.farm_type === 'coffee' ? 'Varieties / Certs' : 'Tea types / Certs'}</dt>
            <dd>
              {tags.map(t => (
                <span key={t} className="type-badge" style={{ marginRight: '0.3rem' }}>{t}</span>
              ))}
            </dd>
          </>
        )}
        {sub.processing_methods.length > 0 && (
          <>
            <dt>Processing</dt>
            <dd>{sub.processing_methods.join(', ')}</dd>
          </>
        )}

        <dt>Submitted</dt>
        <dd>
          {new Date(sub.submitted_at).toLocaleString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })}
        </dd>

        {sub.submitter_name && <><dt>Submitter</dt><dd>{sub.submitter_name}</dd></>}
        {sub.submitter_email && <><dt>Email</dt><dd><a href={`mailto:${sub.submitter_email}`}>{sub.submitter_email}</a></dd></>}
        {sub.submitter_notes && <><dt>Notes</dt><dd>{sub.submitter_notes}</dd></>}

        {sub.reviewer_notes && (
          <>
            <dt>Reviewer notes</dt>
            <dd>{sub.reviewer_notes}</dd>
          </>
        )}
      </dl>

      <SubmissionActions submission={sub} />
    </>
  )
}
