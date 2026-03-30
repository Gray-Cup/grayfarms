import Footer from '@/components/Footer'

export const metadata = {
  title: 'Pages | Gray Farms',
  description: 'All pages on Gray Farms — explore coffee and tea farms by region across India.',
}

const CARDS = [
  {
    label: 'South India',
    href: '/region/south-india',
    description: 'Coffee and tea farms in Karnataka, Kerala, Tamil Nadu, and Andhra Pradesh.',
  },
  {
    label: 'North East India',
    href: '/region/north-east-india',
    description: 'Tea estates in Assam, Sikkim, Meghalaya, and across the seven sisters.',
  },
  {
    label: 'East India',
    href: '/region/east-india',
    description: 'Darjeeling and other estates in West Bengal, Odisha, and Jharkhand.',
  },
  {
    label: 'North India',
    href: '/region/north-india',
    description: 'High-altitude tea gardens in Himachal Pradesh and Uttarakhand.',
  },
  {
    label: 'West India',
    href: '/region/west-india',
    description: 'Emerging coffee and tea farms in Maharashtra and surrounding states.',
  },
]

export default function PagesPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible', maxWidth: '720px' }}>
        <a href="/" className="back">← Back to directory</a>
        <h1 style={{ fontSize: 'var(--text-heading)', marginBottom: '0.5rem' }}>Pages</h1>
        <p style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-small)', marginBottom: '2rem' }}>
          Everything on Gray Farms.
        </p>
        <div className="pages-grid">
          {CARDS.map(card => (
            <a key={card.href} href={card.href} className="pages-card">
              <span className="pages-card-label">{card.label}</span>
              <span className="pages-card-desc">{card.description}</span>
            </a>
          ))}
        </div>
        <Footer />
      </div>
    </div>
  )
}
