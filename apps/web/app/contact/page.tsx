import Footer from '@/components/Footer'

export const metadata = {
  title: 'Contact — Gray Farms',
  description: 'Get in touch with Gray Farms or Gray Cup Enterprises.',
}

export default function ContactPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/" className="back">← Back to directory</a>
        <h2>Contact</h2>

        <p className="about-lead">
          Have a question, a farm to suggest, or just want to say hello?
          Reach out through any of the channels below.
        </p>

        <div className="about-section">
          <h3>Email</h3>
          <p>
            <a href="mailto:arjun@graycup.in">arjun@graycup.in</a>
            <br />
            <a href="mailto:office@graycup.org">office@graycup.org</a>
          </p>
        </div>

        <div className="about-section">
          <h3>Instagram</h3>
          <p>
            <a href="https://instagram.com/arjun_sustains" target="_blank" rel="noopener noreferrer">
              @arjun_sustains
            </a>
          </p>
        </div>

        <Footer />
      </div>
    </div>
  )
}
