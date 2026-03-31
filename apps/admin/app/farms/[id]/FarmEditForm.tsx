'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CoffeeFarmData, TeaFarmData, FarmContact } from '@farms/db'

interface Props {
  farm: CoffeeFarmData | TeaFarmData
  farmType: 'coffee' | 'tea'
  contact: FarmContact | null
}

export default function FarmEditForm({ farm, farmType, contact }: Props) {
  const router = useRouter()

  // Public info state
  const [info, setInfo] = useState({
    name: farm.name,
    state: farm.state,
    city: farm.city,
    address: farm.address ?? '',
    pincode: farm.pincode ?? '',
    url: farm.url ?? '',
    description: farm.description ?? '',
    elevation_meters: farm.elevation_meters ?? '',
  })

  // Contact state
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')

  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [contactMsg, setContactMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault()
    setLoading('info')
    setInfoMsg(null)
    try {
      const res = await fetch(`/api/farms/${farm.id}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmType, updates: { ...info, elevation_meters: info.elevation_meters ? Number(info.elevation_meters) : null } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setInfoMsg({ type: 'success', text: 'Committed to GitHub.' })
      router.refresh()
    } catch (err) {
      setInfoMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoading(null)
    }
  }

  async function saveContact(e: React.FormEvent) {
    e.preventDefault()
    setLoading('contact')
    setContactMsg(null)
    try {
      const res = await fetch(`/api/farms/${farm.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmType, phone: phone || null, email: email || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setContactMsg({ type: 'success', text: 'Contact info saved.' })
    } catch (err) {
      setContactMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoading(null)
    }
  }

  async function handleDelete(mode: 'commit' | 'pr') {
    if (!confirm(`Delete "${farm.name}"? This cannot be undone.`)) return
    setLoading('delete')
    setDeleteMsg(null)
    try {
      const res = await fetch(`/api/farms/${farm.id}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farmType, farmName: farm.name, mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (mode === 'pr') {
        setDeleteMsg({ type: 'success', text: `PR opened: ${data.pr_url}` })
      } else {
        setDeleteMsg({ type: 'success', text: 'Farm deleted and committed.' })
        router.push('/farms')
      }
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoading(null)
    }
  }

  const field = (label: string, key: keyof typeof info, type = 'text') => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={info[key] as string}
        onChange={e => setInfo(s => ({ ...s, [key]: e.target.value }))}
      />
    </div>
  )

  return (
    <div style={{ marginTop: '1.5rem' }}>

      {/* Public info */}
      <h3 style={{ fontSize: 'var(--text-small)', marginBottom: '1rem' }}>Public info</h3>
      <form onSubmit={saveInfo}>
        {field('Name', 'name')}
        {field('State', 'state')}
        {field('City', 'city')}
        {field('Address', 'address')}
        {field('Pincode', 'pincode')}
        {field('Website URL', 'url', 'url')}
        {field('Elevation (m)', 'elevation_meters', 'number')}
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={info.description}
            onChange={e => setInfo(s => ({ ...s, description: e.target.value }))}
          />
        </div>
        {infoMsg && <div className={`alert alert-${infoMsg.type}`}>{infoMsg.text}</div>}
        <div className="btn-row">
          <button className="btn btn-primary" type="submit" disabled={loading !== null}>
            {loading === 'info' ? 'Saving…' : 'Save & commit to GitHub'}
          </button>
        </div>
      </form>

      {/* Contact info */}
      <h3 style={{ fontSize: 'var(--text-small)', margin: '2rem 0 1rem' }}>Contact info</h3>
      <p style={{ fontSize: 'var(--text-xsmall)', color: 'var(--color-muted)', marginBottom: '1rem' }}>
        Stored in Postgres only — never committed to the repository.
      </p>
      <form onSubmit={saveContact}>
        <div className="form-group">
          <label>Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        {contactMsg && <div className={`alert alert-${contactMsg.type}`}>{contactMsg.text}</div>}
        <div className="btn-row">
          <button className="btn btn-primary" type="submit" disabled={loading !== null}>
            {loading === 'contact' ? 'Saving…' : 'Save contact info'}
          </button>
        </div>
      </form>

      {/* Delete */}
      <h3 style={{ fontSize: 'var(--text-small)', margin: '2rem 0 1rem', color: '#c00' }}>Danger zone</h3>
      {deleteMsg && <div className={`alert alert-${deleteMsg.type}`}>{deleteMsg.text}</div>}
      <div className="btn-row">
        <button
          className="btn btn-danger"
          disabled={loading !== null}
          onClick={() => handleDelete('commit')}
        >
          {loading === 'delete' ? 'Deleting…' : 'Delete & commit directly'}
        </button>
        <button
          className="btn"
          disabled={loading !== null}
          onClick={() => handleDelete('pr')}
        >
          Delete & open PR
        </button>
      </div>
    </div>
  )
}
