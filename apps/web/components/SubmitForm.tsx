'use client'

import { useState } from 'react'
import type { FarmType } from '@farms/db'

const COFFEE_VARIETIES = ['Arabica', 'Robusta', 'Liberica', 'Excelsa', 'Kents', 'S795', 'Cauvery']
const COFFEE_PROCESSING = ['Washed', 'Natural', 'Honey', 'Wet-Hulled', 'Anaerobic']
const CERTIFICATIONS = ['Organic', 'Fair Trade', 'Rainforest Alliance', 'UTZ', 'Bird Friendly']
const TEA_TYPES = ['Green', 'Black', 'White', 'Oolong', 'Yellow', 'Pu-erh', 'Purple']
const TEA_PROCESSING = ['Orthodox', 'CTC', 'Handcrafted', 'First Flush', 'Second Flush']

async function geocodeAddress(address: string, city: string, state: string) {
  const q = encodeURIComponent(`${address}, ${city}, ${state}, India`)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&countrycodes=in`,
    { headers: { 'Accept-Language': 'en' } }
  )
  if (!res.ok) return null
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
}

export default function SubmitForm() {
  const [farmType, setFarmType] = useState<FarmType>('coffee')
  const [form, setForm] = useState({
    name: '', state: '', city: '', address: '', pincode: '', url: '', description: '',
    elevation_meters: '', submitter_name: '', submitter_email: '', submitter_notes: '',
  })
  const [varieties, setVarieties] = useState<string[]>([])
  const [teaTypes, setTeaTypes] = useState<string[]>([])
  const [processing, setProcessing] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggleArr = (arr: string[], setArr: (a: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    // Geocode the address via Nominatim (OpenStreetMap)
    const coords = form.address
      ? await geocodeAddress(form.address, form.city, form.state)
      : null

    const payload = {
      farm_type: farmType,
      ...form,
      elevation_meters: form.elevation_meters ? parseInt(form.elevation_meters, 10) : null,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      varieties: farmType === 'coffee' ? varieties : [],
      tea_types: farmType === 'tea' ? teaTypes : [],
      processing_methods: processing,
      certifications: certs,
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Submission failed')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (status === 'success') {
    return (
      <div className="form-page">
        <a href="/" className="back">← Back to directory</a>
        <div className="form-success">
          <strong>Thank you!</strong> Your submission has been received and will be reviewed by our team.
          Once approved, a pull request will be opened on GitHub and the farm will appear on the directory
          after it is merged.
        </div>
      </div>
    )
  }

  return (
    <form className="form-page" onSubmit={handleSubmit}>
      <a href="/" className="back">← Back to directory</a>
      <h2>Submit a Farm</h2>

      {/* Farm type */}
      <div className="form-group">
        <label>Farm type</label>
        <select value={farmType} onChange={e => setFarmType(e.target.value as FarmType)}>
          <option value="coffee">Coffee Farm</option>
          <option value="tea">Tea Estate</option>
        </select>
      </div>

      {/* Core info */}
      <p className="form-section-title">Farm Details</p>

      <div className="form-group">
        <label>Farm / Estate name *</label>
        <input type="text" required value={form.name} onChange={set('name')} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>State *</label>
          <input type="text" required value={form.state} onChange={set('state')}
            placeholder={farmType === 'coffee' ? 'e.g. Karnataka' : 'e.g. Assam'} />
        </div>
        <div className="form-group">
          <label>City / Region *</label>
          <input type="text" required value={form.city} onChange={set('city')}
            placeholder={farmType === 'coffee' ? 'e.g. Coorg' : 'e.g. Darjeeling'} />
        </div>
      </div>

      <div className="form-group">
        <label>Address</label>
        <input type="text" value={form.address} onChange={set('address')} />
        <p className="hint">Used to automatically find the farm&apos;s coordinates on the map.</p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Pincode</label>
          <input type="text" value={form.pincode} onChange={set('pincode')} />
        </div>
        <div className="form-group">
          <label>Elevation (metres)</label>
          <input type="number" value={form.elevation_meters} onChange={set('elevation_meters')}
            min="0" max="3000" />
        </div>
      </div>

      <div className="form-group">
        <label>Website URL</label>
        <input type="url" value={form.url} onChange={set('url')} placeholder="https://" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea value={form.description} onChange={set('description')}
          placeholder="Brief description of the farm, its history, or what makes it unique." />
      </div>

      {/* Coffee-specific */}
      {farmType === 'coffee' && (
        <>
          <p className="form-section-title">Coffee Details</p>
          <div className="form-group">
            <label>Varieties grown</label>
            <div className="checkbox-grid">
              {COFFEE_VARIETIES.map(v => (
                <label key={v}>
                  <input type="checkbox" checked={varieties.includes(v)}
                    onChange={() => toggleArr(varieties, setVarieties, v)} />
                  {v}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Processing methods</label>
            <div className="checkbox-grid">
              {COFFEE_PROCESSING.map(p => (
                <label key={p}>
                  <input type="checkbox" checked={processing.includes(p)}
                    onChange={() => toggleArr(processing, setProcessing, p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tea-specific */}
      {farmType === 'tea' && (
        <>
          <p className="form-section-title">Tea Details</p>
          <div className="form-group">
            <label>Tea types produced</label>
            <div className="checkbox-grid">
              {TEA_TYPES.map(t => (
                <label key={t}>
                  <input type="checkbox" checked={teaTypes.includes(t)}
                    onChange={() => toggleArr(teaTypes, setTeaTypes, t)} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Processing methods</label>
            <div className="checkbox-grid">
              {TEA_PROCESSING.map(p => (
                <label key={p}>
                  <input type="checkbox" checked={processing.includes(p)}
                    onChange={() => toggleArr(processing, setProcessing, p)} />
                  {p}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Certifications (shared) */}
      <div className="form-group">
        <label>Certifications</label>
        <div className="checkbox-grid">
          {CERTIFICATIONS.map(c => (
            <label key={c}>
              <input type="checkbox" checked={certs.includes(c)}
                onChange={() => toggleArr(certs, setCerts, c)} />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Submitter info */}
      <p className="form-section-title">About You (optional)</p>

      <div className="form-row">
        <div className="form-group">
          <label>Your name</label>
          <input type="text" value={form.submitter_name} onChange={set('submitter_name')} />
        </div>
        <div className="form-group">
          <label>Your email</label>
          <input type="email" value={form.submitter_email} onChange={set('submitter_email')} />
          <p className="hint">Only used if we need to follow up.</p>
        </div>
      </div>

      <div className="form-group">
        <label>Additional notes</label>
        <textarea value={form.submitter_notes} onChange={set('submitter_notes')}
          placeholder="Anything else we should know?" />
      </div>

      {status === 'error' && (
        <div className="form-error">{errorMsg}</div>
      )}

      <button type="submit" className="btn-submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Submitting…' : 'Submit Farm'}
      </button>
    </form>
  )
}
