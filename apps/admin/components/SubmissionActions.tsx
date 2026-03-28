'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Submission } from '@farms/db'

export default function SubmissionActions({ submission }: { submission: Submission }) {
  const router = useRouter()
  const [notes, setNotes] = useState(submission.reviewer_notes ?? '')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isPending = submission.status === 'pending'
  const canApprove = submission.status === 'pending' || submission.status === 'approved'

  async function callAction(action: 'approve' | 'reject') {
    setLoading(action)
    setMessage(null)
    try {
      const res = await fetch(`/api/submissions/${submission.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewer_notes: notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')

      if (action === 'approve') {
        setMessage({
          type: 'success',
          text: `PR created: ${data.pr_url}`,
        })
      } else {
        setMessage({ type: 'success', text: 'Submission rejected.' })
      }
      router.refresh()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Something went wrong',
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' && message.text.startsWith('PR created:') ? (
            <>
              PR created:{' '}
              <a href={message.text.replace('PR created: ', '')} target="_blank" rel="noopener noreferrer">
                {message.text.replace('PR created: ', '')}
              </a>
            </>
          ) : (
            message.text
          )}
        </div>
      )}

      <div className="form-group">
        <label>Reviewer notes (optional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Internal notes about this submission…"
        />
      </div>

      <div className="btn-row">
        {canApprove && (
          <button
            className="btn btn-primary"
            disabled={loading !== null}
            onClick={() => callAction('approve')}
          >
            {loading === 'approve'
              ? 'Creating PR…'
              : submission.status === 'pr_created'
              ? 'Re-open PR'
              : 'Approve & open PR'}
          </button>
        )}

        {isPending && (
          <button
            className="btn btn-danger"
            disabled={loading !== null}
            onClick={() => callAction('reject')}
          >
            {loading === 'reject' ? 'Rejecting…' : 'Reject'}
          </button>
        )}

        {submission.github_pr_url && (
          <a
            href={submission.github_pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            View PR on GitHub →
          </a>
        )}
      </div>
    </div>
  )
}
