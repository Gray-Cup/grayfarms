export const metadata = {
  title: 'Get Your Website Built by Gray Cup',
}

export default function GetYourWebsitePage() {
  return (
    <div className="layout" style={{ display: 'block' }}>
      <div className="form-page">
        <a href="/" className="back">← Back</a>
        <h2>Get Your Website Built by Gray Cup</h2>
        <p style={{ fontSize: 'var(--text-small)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          We build fast, beautiful, and purposeful websites for farms, businesses, and creators.
          Whether you need a simple landing page or a full directory like this one — we&apos;ve got you.
        </p>
        <p style={{ fontSize: 'var(--text-small)', lineHeight: 1.7, marginBottom: '2rem' }}>
          Reach out at{' '}
          <a href="https://graycup.com" target="_blank" rel="noopener noreferrer">
            graycup.com
          </a>{' '}
          and let&apos;s build something together.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <a
            href="https://graycup.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-submit"
            style={{ display: 'inline-block', textDecoration: 'none', background: '#111', color: '#fff' }}
          >
            Visit Gray Cup →
          </a>
          <a
            href="https://wa.me/918527914317?text=I%20would%20like%20to%20enquire%20about%20websites%20you%20make%20and%20I%20got%20your%20number%20from%20grayfarms"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-submit"
            style={{ display: 'inline-block', textDecoration: 'none', background: '#25D366', color: '#fff' }}
          >
            Send a Message on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
