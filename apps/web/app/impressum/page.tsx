import Footer from '@/components/Footer'

export const metadata = {
  title: 'Impressum — Gray Farms',
}

export default function ImpressumPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/" className="back">← Back to directory</a>
        <h2>Impressum</h2>

        <div className="about-section">
          <h3>Responsible for content</h3>
          <p>
            <a href="https://arjunaditya.xyz" target="_blank" rel="noopener noreferrer">Arjun Aditya</a><br />
            Founder, Gray Cup Enterprises Private Limited<br />
            <a href="https://graycup.org" target="_blank" rel="noopener noreferrer">graycup.org</a>
          </p>
        </div>

        <div className="about-section">
          <h3>Company</h3>
          <p>
            <strong>Gray Cup Enterprises Private Limited</strong><br />
            FF122, Rodeo Drive Mall, GT Road, TDI City,<br />
            Kundli, Sonipat, Haryana — 131030, India
          </p>
          <p>
            Incorporated: November 7, 2025<br />
            CIN: U47211DL2025PTC457808<br />
            GST: 06AAMCG4985H1Z4<br />
            IEC: AAMCG4985H<br />
            FSSAI: 23326008000195
          </p>
          <p>
            Email:{' '}
            <a href="mailto:graycup.enterprises@gmail.com">graycup.enterprises@gmail.com</a>
          </p>
        </div>

        <div className="about-section">
          <h3>About this site</h3>
          <p>
            Gray Farms is a free and open directory of coffee and tea farms across India,
            operated by Gray Cup Enterprises Private Limited. It is provided at no cost as
            a public resource to help Indian farms gain international visibility.
          </p>
        </div>

        <div className="about-section">
          <h3>Disclaimer</h3>
          <p>
            All farm listings are community-submitted and provided in good faith. Gray Farms does not
            verify the accuracy of individual listings and accepts no liability for incorrect or
            outdated information. If you spot an error, please open an issue on{' '}
            <a href="https://github.com/Gray-Cup/grayfarms" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </div>

        <div className="about-section">
          <h3>Data & privacy</h3>
          <p>
            This site does not use cookies or collect personal data beyond what is voluntarily
            submitted through the farm submission form (name and email are optional and used only
            for follow-up if needed). Contact information on farm listings is protected by
            Cloudflare Turnstile to prevent automated scraping. No data is sold or shared
            with third parties.
          </p>
        </div>

        <div className="about-section">
          <h3>Source code</h3>
          <p>
            The directory is fully open source.{' '}
            <a href="https://github.com/Gray-Cup/grayfarms" target="_blank" rel="noopener noreferrer">
              View it on GitHub →
            </a>
          </p>
        </div>
        <Footer />
      </div>
    </div>
  )
}
