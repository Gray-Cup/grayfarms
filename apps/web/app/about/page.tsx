import Footer from '@/components/Footer'

export const metadata = {
  title: 'About — Gray Farms',
  description: 'Gray Farms is an open directory of coffee and tea estates across India, built by Gray Cup.',
}

export default function AboutPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/" className="back">← Back to directory</a>
        <h2>About Gray Farms</h2>

        <p className="about-lead">
          Gray Farms is an open directory of coffee and tea estates across India —
          built to make it easy to discover farms, understand their growing practices,
          and connect growers with curious people.
        </p>

        <div className="about-section">
          <h3>What we track</h3>
          <p>
            Each listing includes the farm&apos;s name, location, elevation, varieties grown,
            processing methods, certifications, and a direct link to their website where
            available. All farms are pinned on an interactive map so you can explore by region.
          </p>
        </div>

        <div className="about-section">
          <h3>How it works</h3>
          <p>
            Anyone can submit a farm using the Submit button on the directory. Submissions
            are reviewed and, once approved, added via a pull request on GitHub. The data
            lives in plain JSON files — fully open and auditable.
          </p>
        </div>

        <div className="about-section">
          <h3>Built by Gray Cup</h3>
          <p>
            Gray Farms is a project by{' '}
            <a href="https://graycup.org" target="_blank" rel="noopener noreferrer">Gray Cup</a>
            {' '}— Gray Cup Enterprises Private Limited, an Indian company focused on sourcing,
            trading, and exporting tea, coffee, and spices. Gray Farms is our way of giving
            back to the community that grows what we love.
          </p>
        </div>

        <div className="about-section">
          <h3>Who made this</h3>
          <p>
            Gray Farms was designed and built by{' '}
            <a href="https://arjunaditya.xyz" target="_blank" rel="noopener noreferrer">Arjun Aditya</a>,
            Director at Gray Cup, with interests in nature, code, and design.
          </p>
        </div>

        <div className="about-section">
          <h3>Legal details</h3>
          <p>
            <strong>Gray Cup Enterprises Private Limited</strong><br />
            FF122, Rodeo Drive Mall, GT Road, TDI City,<br />
            Kundli, Sonipat, Haryana — 131030, India
          </p>
          <p>
            CIN: U47211DL2025PTC457808<br />
            GST: 06AAMCG4985H1Z4<br />
            Email:{' '}
            <a href="mailto:graycup.enterprises@gmail.com">graycup.enterprises@gmail.com</a>
          </p>
        </div>

        <div className="about-section">
          <h3>Source code</h3>
          <p>
            The directory is fully open source.{' '}
            <a href="https://github.com/Gray-Cup/farms-directory" target="_blank" rel="noopener noreferrer">
              View it on GitHub →
            </a>
          </p>
        </div>

        <div className="about-cta">
          <p>Want to learn more about Gray Cup?</p>
          <a href="https://graycup.org/about" target="_blank" rel="noopener noreferrer" className="about-cta-link">
            Visit graycup.org →
          </a>
        </div>
        <Footer />
      </div>
    </div>
  )
}
