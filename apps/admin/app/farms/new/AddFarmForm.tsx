'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const COFFEE_VARIETIES = ['Arabica', 'Robusta', 'Liberica', 'Excelsa']
const TEA_TYPES = ['Green', 'Black', 'White', 'Oolong', 'Yellow', 'Pu-erh', 'Darjeeling', 'Assam', 'Nilgiri']
const PROCESSING = ['Washed', 'Natural', 'Honey', 'Wet-Hulled', 'Anaerobic', 'CTC', 'Orthodox', 'Steamed']
const CERTIFICATIONS = ['Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', 'Bird Friendly', 'GI', 'USDA Organic']

function TagInput({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [custom, setCustom] = useState('')

  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  function addCustom() {
    const v = custom.trim()
    if (v && !selected.includes(v)) onChange([...selected, v])
    setCustom('')
  }

  return (
    <div className="form-group">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            style={{
              padding: '0.2rem 0.6rem',
              fontSize: 'var(--text-xsmall)',
              borderRadius: '999px',
              border: '1px solid var(--color-border)',
              background: selected.includes(opt) ? 'var(--color-accent)' : 'transparent',
              color: selected.includes(opt) ? '#fff' : 'inherit',
              cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <input
          type="text"
          placeholder="Add custom…"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          style={{ flex: 1 }}
        />
        <button type="button" className="btn" onClick={addCustom} style={{ whiteSpace: 'nowrap' }}>
          Add
        </button>
      </div>
      {selected.filter(v => !options.includes(v)).map(v => (
        <span key={v} style={{ fontSize: 'var(--text-xsmall)', marginRight: '0.4rem' }}>
          {v}{' '}
          <button type="button" onClick={() => toggle(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c00' }}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export default function AddFarmForm() {
  const router = useRouter()

  const [farmType, setFarmType] = useState<'coffee' | 'tea'>('coffee')
  const [info, setInfo] = useState({
    name: '',
    state: '',
    city: '',
    address: '',
    pincode: '',
    url: '',
    instagram: '',
    description: '',
    elevation_meters: '',
    lat: '',
    lng: '',
  })
  const [varieties, setVarieties] = useState<string[]>([])
  const [teaTypes, setTeaTypes] = useState<string[]>([])
  const [processingMethods, setProcessingMethods] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const field = (label: string, key: keyof typeof info, type = 'text', required = false) => (
    <div className="form-group">
      <label>{label}{required && ' *'}</label>
      <input
        type={type}
        required={required}
        value={info[key] as string}
        onChange={e => setInfo(s => ({ ...s, [key]: e.target.value }))}
      />
    </div>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const id = crypto.randomUUID()

    const base = {
      id,
      name: info.name,
      state: info.state,
      city: info.city,
      address: info.address || null,
      pincode: info.pincode || null,
      lat: info.lat !== '' ? Number(info.lat) : null,
      lng: info.lng !== '' ? Number(info.lng) : null,
      url: info.url || null,
      instagram: info.instagram || null,
      description: info.description || null,
      elevation_meters: info.elevation_meters ? Number(info.elevation_meters) : null,
      processing_methods: processingMethods,
      certifications,
      active: true,
    }

    const farm = farmType === 'coffee'
      ? { ...base, varieties }
      : { ...base, tea_types: teaTypes }

    try {
      const res = await fetch('/api/farms/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmType,
          farm,
          contact: { phone: phone || null, email: email || null },
        }),
      })
      const data = await res.json()
      if (!res.ok && res.status !== 207) throw new Error(data.error || 'Failed')
      if (res.status === 207) {
        setMsg({ type: 'error', text: data.error })
      } else {
        setMsg({ type: 'success', text: `Farm added and committed to GitHub. ID: ${id}` })
        setTimeout(() => router.push(`/farms/${id}?type=${farmType}`), 1500)
      }
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
      <div className="form-group">
        <label>Farm type *</label>
        <select
          value={farmType}
          onChange={e => setFarmType(e.target.value as 'coffee' | 'tea')}
        >
          <option value="coffee">Coffee</option>
          <option value="tea">Tea</option>
        </select>
      </div>

      <h3 style={{ fontSize: 'var(--text-small)', margin: '1.5rem 0 1rem' }}>Public info</h3>

      {field('Name', 'name', 'text', true)}
      {field('State', 'state', 'text', true)}
      {field('City', 'city', 'text', true)}
      {field('Address', 'address')}
      {field('Pincode', 'pincode')}
      {field('Latitude', 'lat', 'number')}
      {field('Longitude', 'lng', 'number')}
      {field('Website URL', 'url', 'url')}
      {field('Instagram', 'instagram')}
      {field('Elevation (m)', 'elevation_meters', 'number')}

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={info.description}
          onChange={e => setInfo(s => ({ ...s, description: e.target.value }))}
        />
      </div>

      {farmType === 'coffee' ? (
        <TagInput label="Varieties" options={COFFEE_VARIETIES} selected={varieties} onChange={setVarieties} />
      ) : (
        <TagInput label="Tea types" options={TEA_TYPES} selected={teaTypes} onChange={setTeaTypes} />
      )}

      <TagInput label="Processing methods" options={PROCESSING} selected={processingMethods} onChange={setProcessingMethods} />
      <TagInput label="Certifications" options={CERTIFICATIONS} selected={certifications} onChange={setCertifications} />

      <h3 style={{ fontSize: 'var(--text-small)', margin: '2rem 0 1rem' }}>Contact info</h3>
      <p style={{ fontSize: 'var(--text-xsmall)', color: 'var(--color-muted)', marginBottom: '1rem' }}>
        Stored in Postgres only — never committed to the repository.
      </p>

      <div className="form-group">
        <label>Phone</label>
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <div className="btn-row">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Adding…' : 'Add farm & commit to GitHub'}
        </button>
      </div>
    </form>
  )
}
