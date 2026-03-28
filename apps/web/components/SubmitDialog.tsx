'use client'

import { useState } from 'react'
import type { FarmType } from '@farms/db'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

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

const emptyForm = {
  name: '', state: '', city: '', address: '', pincode: '',
  url: '', description: '', elevation_meters: '',
  submitter_name: '', submitter_email: '',
}

function CheckGroup({
  items, selected, onChange,
}: { items: string[]; selected: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map(item => (
        <label key={item} className="flex items-center gap-1.5 cursor-pointer text-sm">
          <Checkbox
            checked={selected.includes(item)}
            onCheckedChange={() => onChange(item)}
          />
          {item}
        </label>
      ))}
    </div>
  )
}

interface Props {
  open?: boolean
  onOpenChange?: (v: boolean) => void
}

export default function SubmitDialog({ open: externalOpen, onOpenChange: externalSetOpen }: Props = {}) {
  const isControlled = externalOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? externalOpen! : internalOpen
  const [farmType, setFarmType] = useState<FarmType>('coffee')
  const [form, setForm] = useState(emptyForm)
  const [varieties, setVarieties] = useState<string[]>([])
  const [teaTypes, setTeaTypes] = useState<string[]>([])
  const [processing, setProcessing] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const toggle = (arr: string[], setArr: (a: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])

  function reset() {
    setFarmType('coffee')
    setForm(emptyForm)
    setVarieties([]); setTeaTypes([]); setProcessing([]); setCerts([])
    setStatus('idle'); setErrorMsg('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    const coords = form.address ? await geocodeAddress(form.address, form.city, form.state) : null
    const payload = {
      farm_type: farmType, ...form,
      elevation_meters: form.elevation_meters ? parseInt(form.elevation_meters, 10) : null,
      lat: coords?.lat ?? null, lng: coords?.lng ?? null,
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

  const handleOpenChange = (v: boolean) => {
    if (!isControlled) setInternalOpen(v)
    externalSetOpen?.(v)
    if (!v) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <button className="submit-btn" onClick={() => handleOpenChange(true)}>
          Submit a farm
        </button>
      )}

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
        {status === 'success' ? (
          <div className="p-6 flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Submitted!</DialogTitle>
              <DialogDescription>
                Your submission has been received and will be reviewed. Once approved, the farm will appear in the directory.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => { setOpen(false); reset() }}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0">
            <div className="p-6 pb-4 shrink-0">
              <DialogHeader>
                <DialogTitle>Submit a Farm</DialogTitle>
                <DialogDescription>
                  Know a coffee or tea farm in India? Add it to the directory.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable fields */}
            <div className="overflow-y-auto px-6 flex flex-col gap-4 flex-1 pb-2">
              {/* Farm type */}
              <div className="grid gap-1.5">
                <Label>Farm type</Label>
                <Select value={farmType} onValueChange={v => setFarmType(v as FarmType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coffee">Coffee Farm</SelectItem>
                    <SelectItem value="tea">Tea Estate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div className="grid gap-1.5">
                <Label>Farm / Estate name *</Label>
                <Input required value={form.name} onChange={set('name')} />
              </div>

              {/* State + City */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>State *</Label>
                  <Input required value={form.state} onChange={set('state')}
                    placeholder={farmType === 'coffee' ? 'Karnataka' : 'Assam'} />
                </div>
                <div className="grid gap-1.5">
                  <Label>City / Region *</Label>
                  <Input required value={form.city} onChange={set('city')}
                    placeholder={farmType === 'coffee' ? 'Coorg' : 'Darjeeling'} />
                </div>
              </div>

              {/* Address */}
              <div className="grid gap-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={set('address')} />
                <p className="text-xs text-muted-foreground">Used to pin the farm on the map.</p>
              </div>

              {/* Elevation + URL */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Elevation (m)</Label>
                  <Input type="number" value={form.elevation_meters} onChange={set('elevation_meters')} min="0" max="3000" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Website</Label>
                  <Input type="url" value={form.url} onChange={set('url')} placeholder="https://" />
                </div>
              </div>

              {/* Description */}
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={set('description')}
                  placeholder="What makes this farm unique?" className="resize-none h-20" />
              </div>

              {/* Coffee specifics */}
              {farmType === 'coffee' && (
                <>
                  <div className="grid gap-1.5">
                    <Label>Varieties</Label>
                    <CheckGroup items={COFFEE_VARIETIES} selected={varieties}
                      onChange={v => toggle(varieties, setVarieties, v)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Processing</Label>
                    <CheckGroup items={COFFEE_PROCESSING} selected={processing}
                      onChange={v => toggle(processing, setProcessing, v)} />
                  </div>
                </>
              )}

              {/* Tea specifics */}
              {farmType === 'tea' && (
                <>
                  <div className="grid gap-1.5">
                    <Label>Tea types</Label>
                    <CheckGroup items={TEA_TYPES} selected={teaTypes}
                      onChange={v => toggle(teaTypes, setTeaTypes, v)} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Processing</Label>
                    <CheckGroup items={TEA_PROCESSING} selected={processing}
                      onChange={v => toggle(processing, setProcessing, v)} />
                  </div>
                </>
              )}

              {/* Certifications */}
              <div className="grid gap-1.5">
                <Label>Certifications</Label>
                <CheckGroup items={CERTIFICATIONS} selected={certs}
                  onChange={v => toggle(certs, setCerts, v)} />
              </div>

              {/* Submitter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Your name</Label>
                  <Input value={form.submitter_name} onChange={set('submitter_name')} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Your email</Label>
                  <Input type="email" value={form.submitter_email} onChange={set('submitter_email')} />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-xs text-destructive">{errorMsg}</p>
              )}
            </div>

            <div className="p-6 pt-4 shrink-0">
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Submitting…' : 'Submit Farm'}
                </Button>
              </DialogFooter>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
