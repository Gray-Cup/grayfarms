import { notFound } from 'next/navigation'
import { getCoffeeFarms, getTeaFarms, stripContact, toSlug } from '@/lib/farms'
import { REGIONS, getRegion } from '@/lib/regions'
import Footer from '@/components/Footer'

export const dynamic = 'force-static'

export function generateStaticParams() {
  return REGIONS.map(r => ({ region: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params
  const region = getRegion(slug)
  if (!region) return {}
  return {
    title: `${region.headline} | Gray Farms`,
    description: `Discover coffee and tea farms in ${region.label}. ${region.body.slice(0, 140)}…`,
  }
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region: slug } = await params
  const region = getRegion(slug)
  if (!region) notFound()

  const coffeeFarms = stripContact(getCoffeeFarms()).filter(f =>
    region.states.includes(f.state)
  )
  const teaFarms = stripContact(getTeaFarms()).filter(f =>
    region.states.includes(f.state)
  )

  const total = coffeeFarms.length + teaFarms.length

  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible', maxWidth: '720px' }}>
        <a href="/" className="back">← Back to directory</a>
        <h1 style={{ fontSize: 'var(--text-heading)', marginBottom: '0.75rem' }}>
          {region.headline}
        </h1>
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--app-color-muted)', marginBottom: '1.25rem' }}>
          {total} farm{total !== 1 ? 's' : ''} listed
        </p>
        <p style={{ lineHeight: '1.7', marginBottom: '2rem' }}>
          {region.body}
        </p>

        {total === 0 ? (
          <p style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)' }}>
            No farms listed from this region yet.{' '}
            <a href="/submit">Submit one →</a>
          </p>
        ) : (
          <div style={{ borderTop: '1px solid var(--app-color-border)', paddingTop: '1.5rem' }}>
            {coffeeFarms.length > 0 && (
              <>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Coffee Farms ({coffeeFarms.length})
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                  {coffeeFarms.map(f => (
                    <li key={f.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--app-color-border)' }}>
                      <a href={`/farms/${toSlug(f.name)}`}
                        style={{ fontWeight: 500 }}>
                        {f.name}
                      </a>
                      <span style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)', marginLeft: '0.5rem' }}>
                        {f.city}, {f.state}
                        {f.elevation_meters ? ` · ${f.elevation_meters}m` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {teaFarms.length > 0 && (
              <>
                <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  Tea Estates ({teaFarms.length})
                </h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {teaFarms.map(f => (
                    <li key={f.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--app-color-border)' }}>
                      <a href={`/farms/${toSlug(f.name)}`}
                        style={{ fontWeight: 500 }}>
                        {f.name}
                      </a>
                      <span style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)', marginLeft: '0.5rem' }}>
                        {f.city}, {f.state}
                        {f.elevation_meters ? ` · ${f.elevation_meters}m` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        <Footer />
      </div>
    </div>
  )
}
