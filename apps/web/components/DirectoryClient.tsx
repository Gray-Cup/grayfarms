'use client'

import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'

const FarmMap = dynamic(() => import('./FarmMap'), { ssr: false })

type FarmType = 'coffee' | 'tea'
type AnyFarm = CoffeeFarmData | TeaFarmData

interface Props {
  coffeeFarms: CoffeeFarmData[]
  teaFarms: TeaFarmData[]
}

export default function DirectoryClient({ coffeeFarms, teaFarms }: Props) {
  const [tab, setTab] = useState<FarmType>('coffee')
  const [search, setSearch] = useState('')
  const [selectedStates, setSelectedStates] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showMap, setShowMap] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const farms = tab === 'coffee' ? coffeeFarms : teaFarms

  // Find the selected farm across both lists so the detail panel
  // works even if the user filtered it out of the results.
  const allFarms: AnyFarm[] = useMemo(
    () => [...coffeeFarms, ...teaFarms],
    [coffeeFarms, teaFarms]
  )
  const selectedFarm = selectedId ? allFarms.find(f => f.id === selectedId) ?? null : null

  const allStates = useMemo(
    () => [...new Set(farms.map(f => f.state))].sort(),
    [farms]
  )

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    if (tab === 'coffee') {
      coffeeFarms.forEach(f => {
        f.varieties.forEach(v => tags.add(v))
        f.certifications.forEach(c => tags.add(c))
      })
    } else {
      teaFarms.forEach(f => {
        f.tea_types.forEach(t => tags.add(t))
        f.certifications.forEach(c => tags.add(c))
      })
    }
    return [...tags].sort()
  }, [tab, coffeeFarms, teaFarms])

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
    setSelectedStates(prev =>
      prev.includes(state) ? prev.filter(s => s !== state) : [...prev, state]
    )
    setSelectedId(null)
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
    setSelectedId(null)
  }, [])

  const handleTabChange = (next: FarmType) => {
    setTab(next)
    setSearch('')
    setSelectedStates([])
    setSelectedTags([])
    setSelectedId(null)
  }

  const handleSelect = (id: string | null) => {
    setSelectedId(prev => (prev === id ? null : id))
  }

  // Tags for the selected farm's detail panel
  const selectedFarmTags: string[] = selectedFarm
    ? [
        ...('varieties' in selectedFarm ? selectedFarm.varieties : []),
        ...('tea_types' in selectedFarm ? selectedFarm.tea_types : []),
      ]
    : []
  const selectedFarmProcessing = selectedFarm?.processing_methods ?? []
  const selectedFarmCerts = selectedFarm?.certifications ?? []
  const selectedFarmType: FarmType | null = selectedFarm
    ? 'varieties' in selectedFarm
      ? 'coffee'
      : 'tea'
    : null

  return (
    <div className="layout">
      {/* ── Left sidebar: filters OR farm detail ── */}
      <aside className="filters">
        {selectedFarm ? (
          /* ── Farm detail panel ── */
          <>
            <button
              className="detail-back"
              onClick={() => setSelectedId(null)}
            >
              ← Back to filters
            </button>

            <div className="detail-panel">
              <div className="detail-type">
                {selectedFarmType === 'coffee' ? 'Coffee Farm' : 'Tea Estate'}
              </div>

              <h2 className="detail-name">{selectedFarm.name}</h2>

              <div className="detail-location">
                {selectedFarm.city}, {selectedFarm.state}
                {selectedFarm.elevation_meters && (
                  <span className="detail-elev">
                    {' · '}{selectedFarm.elevation_meters}m
                  </span>
                )}
              </div>

              {selectedFarm.address && (
                <p className="detail-address">{selectedFarm.address}</p>
              )}

              {selectedFarm.url && (
                <a
                  href={selectedFarm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-url"
                >
                  Visit website →
                </a>
              )}

              {selectedFarm.description && (
                <p className="detail-description">{selectedFarm.description}</p>
              )}

              {selectedFarmTags.length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-label">
                    {selectedFarmType === 'coffee' ? 'Varieties' : 'Tea types'}
                  </div>
                  <div className="badges">
                    {selectedFarmTags.map(t => (
                      <span key={t} className="badge badge-primary">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFarmProcessing.length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-label">Processing</div>
                  <div className="badges">
                    {selectedFarmProcessing.map(p => (
                      <span key={p} className="badge">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFarmCerts.length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-label">Certifications</div>
                  <div className="badges">
                    {selectedFarmCerts.map(c => (
                      <span key={c} className="badge">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedFarm.lat != null && selectedFarm.lng != null && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${selectedFarm.lat}&mlon=${selectedFarm.lng}&zoom=13`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-osm-link"
                >
                  View on OpenStreetMap →
                </a>
              )}
            </div>
          </>
        ) : (
          /* ── Filters panel ── */
          <>
            <div className="search">
              <input
                type="search"
                placeholder="Search farms…"
                value={search}
                onChange={e => { setSearch(e.target.value); setSelectedId(null) }}
                aria-label="Search farms"
              />
            </div>

            <label className="show-map-toggle">
              <input
                type="checkbox"
                checked={showMap}
                onChange={e => setShowMap(e.target.checked)}
              />
              Show map
            </label>

            <a
              href="#"
              id="filter-toggle"
              className="filter-toggle"
              onClick={e => { e.preventDefault(); setFilterOpen(o => !o) }}
            >
              {filterOpen ? 'Hide filters' : 'Show filters'}
            </a>

            <div className={`filter-groups${filterOpen ? ' open' : ''}`}>
              {allStates.length > 0 && (
                <fieldset>
                  <legend>
                    State
                    <button
                      data-toggle="state"
                      onClick={() =>
                        setSelectedStates(prev =>
                          prev.length === allStates.length ? [] : [...allStates]
                        )
                      }
                    >
                      {selectedStates.length === allStates.length ? 'Unselect all' : 'Select all'}
                    </button>
                  </legend>
                  {allStates.map(state => (
                    <label key={state}>
                      <input
                        type="checkbox"
                        checked={selectedStates.includes(state)}
                        onChange={() => toggleState(state)}
                      />
                      {state}
                    </label>
                  ))}
                </fieldset>
              )}

              {allTags.length > 0 && (
                <fieldset>
                  <legend>
                    {tab === 'coffee' ? 'Varieties & Certifications' : 'Tea Types & Certifications'}
                    <button
                      data-toggle="tag"
                      onClick={() =>
                        setSelectedTags(prev =>
                          prev.length === allTags.length ? [] : [...allTags]
                        )
                      }
                    >
                      {selectedTags.length === allTags.length ? 'Unselect all' : 'Select all'}
                    </button>
                  </legend>
                  {allTags.map(tag => (
                    <label key={tag}>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                </fieldset>
              )}
            </div>

            <div className="sidebar-footer">
              <p>
                Data is community-submitted.{' '}
                <a href="/submit">Add a farm</a>
              </p>
              <p>
                <a href="https://github.com/graycup/farms-directory" className="light">
                  Source on GitHub
                </a>
              </p>
            </div>
          </>
        )}
      </aside>

      {/* ── Results column ── */}
      <div className="results">
        <div className="tabs">
          <button
            className={`tab-btn${tab === 'coffee' ? ' active' : ''}`}
            onClick={() => handleTabChange('coffee')}
          >
            Coffee Farms
          </button>
          <button
            className={`tab-btn${tab === 'tea' ? ' active' : ''}`}
            onClick={() => handleTabChange('tea')}
          >
            Tea Estates
          </button>
        </div>

        <div className="count">
          {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        </div>

        <div className="results-list">
          {filtered.map(farm => {
            const tags =
              tab === 'coffee'
                ? [...(farm as CoffeeFarmData).varieties, ...(farm as CoffeeFarmData).certifications]
                : [...(farm as TeaFarmData).tea_types, ...(farm as TeaFarmData).certifications]

            return (
              <div
                key={farm.id}
                data-farm={farm.id}
                aria-selected={selectedId === farm.id}
                onClick={() => handleSelect(farm.id)}
              >
                <h3>{farm.name}</h3>
                <div className="meta">
                  <span>{farm.city}, {farm.state}</span>
                  {farm.elevation_meters && (
                    <span>{farm.elevation_meters}m elev.</span>
                  )}
                </div>
                {farm.address && (
                  <div className="address">
                    <span>{farm.address}</span>
                    {farm.url && (
                      <a
                        href={farm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                      >
                        Website →
                      </a>
                    )}
                  </div>
                )}
                {farm.description && (
                  <p>{farm.description.slice(0, 120)}{farm.description.length > 120 ? '…' : ''}</p>
                )}
                {tags.length > 0 && (
                  <div className="badges">
                    {tags.map(t => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p style={{ padding: '1rem', color: 'var(--color-muted)', fontSize: 'var(--text-small)' }}>
              No farms match your filters.
            </p>
          )}
        </div>
      </div>

      {/* ── Map ── */}
      {showMap && (
        <div className="map-aside" data-map>
          <FarmMap
            farms={filtered}
            selectedId={selectedId}
            selectedFarm={selectedFarm}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  )
}
