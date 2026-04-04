'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'
import { SlidersHorizontalIcon } from 'lucide-react'
import TurnstileGate from './TurnstileGate'
import SubmitDialog from './SubmitDialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/slug'

const FarmMap = dynamic(() => import('./FarmMap'), { ssr: false })

type FarmType = 'coffee' | 'tea'
type AnyFarm = CoffeeFarmData | TeaFarmData

interface Props {
  coffeeFarms: CoffeeFarmData[]
  teaFarms: TeaFarmData[]
  initialFarmId?: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function DirectoryClient({ coffeeFarms, teaFarms, initialFarmId }: Props) {
  const [shuffledCoffee] = useState(() => shuffle(coffeeFarms))
  const [shuffledTea] = useState(() => shuffle(teaFarms))

  const initialTab: FarmType = initialFarmId
    ? (coffeeFarms.some(f => f.id === initialFarmId) ? 'coffee' : 'tea')
    : 'coffee'

  const [tab, setTab] = useState<FarmType>(initialTab)
  const [search, setSearch] = useState('')
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(initialFarmId ?? null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)

  const farms = tab === 'coffee' ? shuffledCoffee : shuffledTea

  const allFarms: AnyFarm[] = useMemo(
    () => [...shuffledCoffee, ...shuffledTea],
    [shuffledCoffee, shuffledTea]
  )
  const selectedFarm = selectedId ? allFarms.find(f => f.id === selectedId) ?? null : null

  const allStates = useMemo(
    () => [...new Set(farms.map(f => f.state))].sort(),
    [farms]
  )

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    if (tab === 'coffee') {
      shuffledCoffee.forEach(f => { f.varieties.forEach(v => tags.add(v)); f.certifications.forEach(c => tags.add(c)) })
    } else {
      shuffledTea.forEach(f => { f.tea_types.forEach(t => tags.add(t)); f.certifications.forEach(c => tags.add(c)) })
    }
    return [...tags].sort()
  }, [tab, shuffledCoffee, shuffledTea])

  const activeFilterCount = selectedStates.length + selectedTags.length

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return farms.filter(f => {
      const text = `${f.name} ${f.city} ${f.state} ${f.description ?? ''}`.toLowerCase()
      if (q && !text.includes(q)) return false
      if (selectedStates.length && !selectedStates.includes(f.state)) return false
      if (selectedTags.length) {
        const farmTags = [
          ...('varieties' in f ? f.varieties : []),
          ...('tea_types' in f ? f.tea_types : []),
          ...f.certifications,
        ]
        if (!selectedTags.some(t => farmTags.includes(t))) return false
      }
      return true
    })
  }, [farms, search, selectedStates, selectedTags])

  const toggleState = useCallback((state: string) => {
    setSelectedStates(prev => prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state])
    setSelectedId(null)
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    setSelectedId(null)
  }, [])

  const handleTabChange = (next: FarmType) => {
    setTab(next)
    setSearch('')
    setSelectedStates([])
    setSelectedTags([])
    setSelectedId(null)
    window.history.pushState({}, '', '/')
  }

  const handleSelect = (id: string | null) => {
    const next = selectedId === id ? null : id
    setSelectedId(next)
    if (next) {
      const farm = allFarms.find(f => f.id === next)
      if (farm) window.history.pushState({}, '', `/farms/${toSlug(farm.name)}`)
    } else {
      window.history.pushState({}, '', '/')
    }
  }

  const handleBack = () => {
    setSelectedId(null)
    window.history.pushState({}, '', '/')
  }

  const selectedFarmTags = selectedFarm
    ? [...('varieties' in selectedFarm ? selectedFarm.varieties : []), ...('tea_types' in selectedFarm ? selectedFarm.tea_types : [])]
    : []
  const selectedFarmProcessing = selectedFarm?.processing_methods ?? []
  const selectedFarmCerts = selectedFarm?.certifications ?? []
  const selectedFarmType: FarmType | null = selectedFarm ? ('varieties' in selectedFarm ? 'coffee' : 'tea') : null

  const sidebarFooter = (
    <div className="sidebar-footer">
      <a href="/get-your-website" className="sidebar-cta">
        <span className="sidebar-cta-label">Need a website?</span>
        <span className="sidebar-cta-sub">Custom solutions by Gray Cup →</span>
      </a>
    </div>
  )

  return (
    <>
      <div className="layout" style={{ height: '100vh', overflow: 'hidden' }}>
        <aside className="locations-sidebar">
          {selectedFarm ? (
            <>
              <button className="detail-back" onClick={handleBack}>← Back</button>
              <div className="detail-panel">
                <div className="detail-type">{selectedFarmType === 'coffee' ? 'Coffee Farm' : 'Tea Estate'}</div>
                <h2 className="detail-name">{selectedFarm.name}</h2>
                <div className="detail-location">
                  {selectedFarm.city}, {selectedFarm.state}
                  {selectedFarm.elevation_meters && <span className="detail-elev"> · {selectedFarm.elevation_meters}m</span>}
                </div>
                {selectedFarm.address && <p className="detail-address">{selectedFarm.address}</p>}
                {selectedFarm.url && (
                  <a href={selectedFarm.url} target="_blank" rel="noopener noreferrer" className="detail-url">
                    Visit website →
                  </a>
                )}
                {selectedFarm.description && <p className="detail-description">{selectedFarm.description}</p>}
                {selectedFarmTags.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-label">{selectedFarmType === 'coffee' ? 'Varieties' : 'Tea types'}</div>
                    <div className="badges">{selectedFarmTags.map(t => <span key={t} className="badge badge-primary">{t}</span>)}</div>
                  </div>
                )}
                {selectedFarmProcessing.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-label">Processing</div>
                    <div className="badges">{selectedFarmProcessing.map(p => <span key={p} className="badge">{p}</span>)}</div>
                  </div>
                )}
                {selectedFarmCerts.length > 0 && (
                  <div className="detail-section">
                    <div className="detail-section-label">Certifications</div>
                    <div className="badges">{selectedFarmCerts.map(c => <span key={c} className="badge">{c}</span>)}</div>
                  </div>
                )}
                <div className="detail-section">
                  <div className="detail-section-label">Contact</div>
                  <TurnstileGate farmId={selectedFarm.id} />
                </div>
              </div>
              {sidebarFooter}
            </>
          ) : (
            <>
              <div className="sidebar-desc">
                <p>
                  A community directory of coffee and tea estates across India. Browse farms, explore the map, and{' '}
                  <button className="inline-link" onClick={() => setSubmitOpen(true)}>add your own</button>.
                </p>
              </div>

              <div className="sidebar-top">
                <div className="tabs">
                  <button className={`tab-btn${tab === 'coffee' ? ' active' : ''}`} onClick={() => handleTabChange('coffee')}>Coffee</button>
                  <button className={`tab-btn${tab === 'tea' ? ' active' : ''}`} onClick={() => handleTabChange('tea')}>Tea</button>
                </div>

                <div className="sidebar-controls">
                  <div className="search">
                    <input
                      type="search" placeholder="Search…" value={search}
                      onChange={e => { setSearch(e.target.value); setSelectedId(null) }}
                      aria-label="Search farms"
                    />
                  </div>

                  {/* ── Filter button + shadcn Dialog ── */}
                  <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                    <button className="filter-btn" onClick={() => setFilterOpen(true)} aria-label="Filters">
                      <SlidersHorizontalIcon size={14} />
                      {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
                    </button>

                    <DialogContent className="sm:max-w-sm max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
                      <div className="p-6 pb-4 shrink-0">
                        <DialogHeader>
                          <DialogTitle>Filters</DialogTitle>
                        </DialogHeader>
                      </div>

                      {/* Scrollable filter groups */}
                      <div className="overflow-y-auto px-6 flex flex-col gap-5 flex-1 pb-2">
                        {allStates.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">State</span>
                              <button
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedStates(prev =>
                                  prev.length === allStates.length ? [] : [...allStates]
                                )}
                              >
                                {selectedStates.length === allStates.length ? 'Unselect all' : 'Select all'}
                              </button>
                            </div>
                            <div className="flex flex-col gap-2">
                              {allStates.map(state => (
                                <label key={state} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <Checkbox
                                    checked={selectedStates.includes(state)}
                                    onCheckedChange={() => toggleState(state)}
                                  />
                                  {state}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {allTags.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">
                                {tab === 'coffee' ? 'Varieties & Certifications' : 'Tea Types & Certifications'}
                              </span>
                              <button
                                className="text-xs text-muted-foreground hover:text-foreground"
                                onClick={() => setSelectedTags(prev =>
                                  prev.length === allTags.length ? [] : [...allTags]
                                )}
                              >
                                {selectedTags.length === allTags.length ? 'Unselect all' : 'Select all'}
                              </button>
                            </div>
                            <div className="flex flex-col gap-2">
                              {allTags.map(tag => (
                                <label key={tag} className="flex items-center gap-2 cursor-pointer text-sm">
                                  <Checkbox
                                    checked={selectedTags.includes(tag)}
                                    onCheckedChange={() => toggleTag(tag)}
                                  />
                                  {tag}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 pt-4 shrink-0">
                        <DialogFooter className="flex-row justify-between sm:justify-between">
                          {activeFilterCount > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelectedStates([]); setSelectedTags([]) }}
                            >
                              Clear all
                            </Button>
                          ) : <span />}
                          <DialogClose asChild>
                            <Button size="sm">Done</Button>
                          </DialogClose>
                        </DialogFooter>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="count">
                  {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                  {activeFilterCount > 0 && (
                    <button className="count-clear" onClick={() => { setSelectedStates([]); setSelectedTags([]) }}>
                      · clear filters
                    </button>
                  )}
                </div>
              </div>

              <div className="results-list-wrap">
                <div className="results-list">
                  {filtered.map(farm => {
                    const tags = tab === 'coffee'
                      ? [...(farm as CoffeeFarmData).varieties, ...(farm as CoffeeFarmData).certifications]
                      : [...(farm as TeaFarmData).tea_types, ...(farm as TeaFarmData).certifications]
                    return (
                      <div
                        key={farm.id} data-farm={farm.id}
                        aria-selected={selectedId === farm.id}
                        onClick={() => handleSelect(farm.id)}
                      >
                        <h3>{farm.name}</h3>
                        <div className="meta">
                          <span>{farm.city}, {farm.state}</span>
                          {farm.elevation_meters && <span>{farm.elevation_meters}m elev.</span>}
                        </div>
                        {farm.address && (
                          <div className="address">
                            <span>{farm.address}</span>
                            {farm.url && (
                              <a href={farm.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                Website →
                              </a>
                            )}
                          </div>
                        )}
                        {farm.description && (
                          <p>{farm.description.slice(0, 120)}{farm.description.length > 120 ? '…' : ''}</p>
                        )}
                        {tags.length > 0 && (
                          <div className="badges">{tags.map(t => <span key={t} className="badge">{t}</span>)}</div>
                        )}
                      </div>
                    )
                  })}
                  {filtered.length === 0 && (
                    <p style={{ padding: '1rem', color: 'var(--app-color-muted)', fontSize: 'var(--text-small)' }}>
                      No farms match your filters.
                    </p>
                  )}
                </div>
              </div>

              {sidebarFooter}
            </>
          )}
        </aside>

        <div className="map-aside" data-map>
          <FarmMap farms={filtered} selectedId={selectedId} selectedFarm={selectedFarm} onSelect={handleSelect} />
        </div>
      </div>

      {/* Controlled submit dialog — triggered by "add your own" */}
      <SubmitDialog open={submitOpen} onOpenChange={setSubmitOpen} />
    </>
  )
}
