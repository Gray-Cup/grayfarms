'use client'

// Loaded only via next/dynamic with ssr:false — never runs on the server.
import { useEffect, useRef, useState } from 'react'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'

type AnyFarm = CoffeeFarmData | TeaFarmData

interface Props {
  farms: AnyFarm[]
  selectedId: string | null
  selectedFarm: AnyFarm | null
  onSelect: (id: string | null) => void
}

const COFFEE_COLOR = '#b45309' // amber
const TEA_COLOR    = '#15803d' // green

const isCoffee = (farm: AnyFarm) => 'varieties' in farm

const defStyle = (farm: AnyFarm): L.CircleMarkerOptions => ({
  radius: 7,
  color: '#fff',
  weight: 1.5,
  fillColor: isCoffee(farm) ? COFFEE_COLOR : TEA_COLOR,
  fillOpacity: 0.85,
  className: 'farm-dot',
})

const hiStyle = (farm: AnyFarm): L.CircleMarkerOptions => ({
  radius: 11,
  color: '#fff',
  weight: 2.5,
  fillColor: isCoffee(farm) ? COFFEE_COLOR : TEA_COLOR,
  fillOpacity: 1,
  className: 'farm-dot farm-dot--selected',
})

const TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    options: { subdomains: 'abcd', attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>' },
    labels: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    options: { subdomains: 'abcd', attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>' },
    labels: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
  },
  satellite: {
    url: 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    options: { subdomains: '0123', attribution: '&copy; Google', maxNativeZoom: 20, maxZoom: 20 },
    labels: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
  },
}

export default function FarmMap({ farms, selectedId, selectedFarm, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<string, { marker: L.CircleMarker; farm: AnyFarm }>>(new Map())
  const prevSelectedRef = useRef<string | null>(null)
  const baseTileRef = useRef<L.TileLayer | null>(null)
  const labelsTileRef = useRef<L.TileLayer | null>(null)
  const overlayRef = useRef<L.Polygon | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [satellite, setSatellite] = useState(false)
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  // Watch html.dark class for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Initialise the Leaflet map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    let cancelled = false

    import('leaflet').then(L => {
      if (cancelled || mapRef.current || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(containerRef.current!, {
        maxBounds: [[5, 67], [38, 98]],
        maxBoundsViscosity: 1,
        minZoom: 4,

      }).setView([22, 79], 5)

      mapRef.current = map
      setMapReady(true)

      const isDark = document.documentElement.classList.contains('dark')
      const initTiles = isDark ? TILES.dark : TILES.light
      baseTileRef.current = L.tileLayer(initTiles.url, initTiles.options).addTo(map)

      const addLabels = () => {
        const tiles = document.documentElement.classList.contains('dark') ? TILES.dark : TILES.light
        labelsTileRef.current = L.tileLayer(
          tiles.labels, { subdomains: 'abcd', pane: 'shadowPane' }
        ).addTo(map)
      }

      fetch('/india.geojson')
        .then(r => r.json())
        .then(india => {
          const world: [number, number][] = [[-90, -180], [-90, 180], [90, 180], [90, -180]]
          const polys =
            india.geometry.type === 'Polygon'
              ? [india.geometry.coordinates]
              : india.geometry.coordinates
          const isDarkNow = document.documentElement.classList.contains('dark')
          const poly = L.polygon(
            [world, ...polys.map((p: number[][][]) => p[0].map(c => [c[1], c[0]] as [number, number]))],
            { color: 'none', fillColor: isDarkNow ? '#111' : '#ddd', fillOpacity: 0.6, interactive: false }
          ).addTo(map)
          overlayRef.current = poly
          addLabels()
        })
        .catch(addLabels)
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
      overlayRef.current = null
    }
  }, [])

  // Sync markers whenever the farms list changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then(L => {
      const map = mapRef.current!
      const existing = markersRef.current
      const nextIds = new Set(farms.map(f => f.id))

      // Remove stale markers
      existing.forEach(({ marker }, id) => {
        if (!nextIds.has(id)) {
          marker.remove()
          existing.delete(id)
        }
      })

      // Add new markers
      farms.forEach(farm => {
        if (farm.lat == null || farm.lng == null) return
        if (existing.has(farm.id)) return

        const q = [farm.name, farm.address, farm.city].filter(Boolean).join(', ')
        const popup =
          `<strong>${farm.name}</strong>` +
          (farm.address ? `<br><span class="popup-address">${farm.address}</span>` : '') +
          `<br>${farm.city}, ${farm.state}` +
          (farm.url
            ? `<br><a href="${farm.url}" target="_blank" rel="noopener">Website →</a>`
            : `<br><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}" target="_blank" rel="noopener">View on OpenStreetMap →</a>`)

        const marker = L.circleMarker([farm.lat, farm.lng], defStyle(farm))
          .bindPopup(popup, { autoClose: false })
          .addTo(map)

        marker.on('click', () => onSelect(farm.id))
        existing.set(farm.id, { marker, farm })
      })

      // Only fit bounds when nothing is selected — selecting a farm will flyTo instead
      if (!selectedId) {
        const coords: [number, number][] = []
        existing.forEach(({ marker }, id) => {
          if (nextIds.has(id)) coords.push([marker.getLatLng().lat, marker.getLatLng().lng])
        })
        if (coords.length) {
          map.fitBounds(coords, { padding: [30, 30], maxZoom: 12 })
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farms, onSelect, mapReady])

  // Highlight + flyTo when selection changes
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then(() => {
      const map = mapRef.current!
      const prev = prevSelectedRef.current

      // Deselect previous marker
      if (prev) {
        const entry = markersRef.current.get(prev)
        if (entry) { entry.marker.setStyle(defStyle(entry.farm)); entry.marker.closePopup() }
      }

      // Select new marker and fly to it
      if (selectedId) {
        const entry = markersRef.current.get(selectedId)
        if (entry) {
          entry.marker.setStyle(hiStyle(entry.farm))
          entry.marker.bringToFront()
          entry.marker.openPopup()
        }

        // Fly to the farm's coordinates (use selectedFarm prop for accuracy,
        // fall back to the marker position if the farm was filtered out)
        const lat = selectedFarm?.lat ?? entry?.marker.getLatLng().lat
        const lng = selectedFarm?.lng ?? entry?.marker.getLatLng().lng
        if (lat != null && lng != null) {
          map.setView([lat, lng], 13, { animate: false })
        }
      } else {
        // Nothing selected — zoom back out to show all visible markers
        const coords: [number, number][] = []
        markersRef.current.forEach(({ marker }) => {
          coords.push([marker.getLatLng().lat, marker.getLatLng().lng])
        })
        if (coords.length) {
          map.fitBounds(coords, { padding: [30, 30], maxZoom: 12, animate: true })
        }
      }

      prevSelectedRef.current = selectedId
    })
  }, [selectedId, selectedFarm, mapReady])

  // Swap tile layers when satellite or dark mode changes
  useEffect(() => {
    if (!mapRef.current) return
    import('leaflet').then(L => {
      const map = mapRef.current!
      const tiles = satellite ? TILES.satellite : (darkMode ? TILES.dark : TILES.light)
      if (baseTileRef.current) { baseTileRef.current.remove() }
      if (labelsTileRef.current) { labelsTileRef.current.remove() }
      baseTileRef.current = L.tileLayer(tiles.url, tiles.options).addTo(map)
      labelsTileRef.current = L.tileLayer(tiles.labels, {
        subdomains: 'abcd',
        pane: 'shadowPane',
      }).addTo(map)

      // Update the outside-India overlay fill
      if (overlayRef.current) {
        overlayRef.current.setStyle({
          fillColor: satellite ? '#000' : (darkMode ? '#111' : '#ddd'),
          fillOpacity: satellite ? 0.45 : 0.6,
        })
      }
    })
  }, [satellite, darkMode])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div ref={containerRef} id="map" className={satellite ? 'map--satellite' : ''} />
      <button
        className={`map-style-toggle${satellite ? ' map-style-toggle--active' : ''}`}
        onClick={() => setSatellite(s => !s)}
        title={satellite ? 'Switch to map view' : 'Switch to satellite view'}
      >
        {satellite ? '🗺 Map' : '🛰 Satellite'}
      </button>
    </>
  )
}
