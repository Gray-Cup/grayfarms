export const metadata = {
  title: 'Impressum — Gray Farms',
}

export default function ImpressumPage() {
  return (
    <div className="layout" style={{ display: 'block' }}>
      <div className="form-page">
        <a href="/" className="back">← Back to directory</a>
        <h2>Impressum</h2>

        <div className="about-section">
          <h3>Responsible for content</h3>
          <p>
            Arjun Aditya<br />
            Gray Cup<br />
            <a href="https://graycup.com" target="_blank" rel="noopener noreferrer">graycup.com</a>
          </p>
        </div>

        <div className="about-section">
          <h3>Disclaimer</h3>
          <p>
            All farm listings are community-submitted and provided in good faith. Gray Farms does not
            verify the accuracy of individual listings and accepts no liability for incorrect or
            outdated information. If you spot an error, please open an issue on{' '}
            <a href="https://github.com/Gray-Cup/farms-directory" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>.
          </p>
        </div>

        <div className="about-section">
          <h3>Data & privacy</h3>
          <p>
            This site does not use cookies or collect personal data beyond what is voluntarily
            submitted through the farm submission form (name and email are optional and used only
            for follow-up if needed). No data is sold or shared with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}
