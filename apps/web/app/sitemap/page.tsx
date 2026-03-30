import { getCoffeeFarms, getTeaFarms, toSlug } from '@/lib/farms'
import { REGIONS } from '@/lib/regions'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Sitemap | Gray Farms',
  description: 'A full list of all pages on Gray Farms.',
}

const STATIC_PAGES = [
  { label: 'Home', href: '/' },
  { label: 'Pages', href: '/pages' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Impressum', href: '/impressum' },
]

export default function SitemapPage() {
  const coffeeFarms = getCoffeeFarms()
  const teaFarms = getTeaFarms()

  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible', maxWidth: '720px' }}>
        <a href="/" className="back">← Back to directory</a>
        <h1 style={{ fontSize: 'var(--text-heading)', marginBottom: '2rem' }}>Sitemap</h1>

        <div className="sitemap-section">
          <h2>General</h2>
          <ul>
            {STATIC_PAGES.map(p => (
              <li key={p.href}><a href={p.href}>{p.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="sitemap-section">
          <h2>Regions</h2>
          <ul>
            {REGIONS.map(r => (
              <li key={r.slug}><a href={`/region/${r.slug}`}>{r.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="sitemap-section">
          <h2>Coffee Farms ({coffeeFarms.length})</h2>
          <ul>
            {coffeeFarms.map(f => (
              <li key={f.id}>
                <a href={`/farms/${toSlug(f.name)}`}>{f.name}</a>
                <span style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)', marginLeft: '0.5rem' }}>
                  {f.city}, {f.state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="sitemap-section">
          <h2>Tea Estates ({teaFarms.length})</h2>
          <ul>
            {teaFarms.map(f => (
              <li key={f.id}>
                <a href={`/farms/${toSlug(f.name)}`}>{f.name}</a>
                <span style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)', marginLeft: '0.5rem' }}>
                  {f.city}, {f.state}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Footer />
      </div>
    </div>
  )
}
