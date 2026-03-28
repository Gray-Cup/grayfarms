export const metadata = {
  title: 'About — Gray Farms',
  description: 'About the Gray Farms directory of coffee and tea estates in India.',
}

export default function AboutPage() {
  return (
    <div className="layout" style={{ display: 'block' }}>
      <div className="form-page">
        <a href="/" className="back">← Back to directory</a>
        <h2>About Gray Farms</h2>

        <p className="about-lead">
          Gray Farms is an open, community-driven directory of coffee and tea estates across India.
          Our goal is to make it easy to discover farms, learn about their growing practices, and
          connect growers with curious people.
        </p>

        <div className="about-section">
          <h3>What we track</h3>
          <p>
            Each listing includes the farm&apos;s location, elevation, varieties grown, processing
            methods, certifications, and a direct link to their website where available. All data
            is pinned on an interactive map so you can explore by region.
          </p>
        </div>

        <div className="about-section">
          <h3>How it works</h3>
          <p>
            Anyone can submit a farm using the <a href="/">Submit a Farm</a> button on the directory.
            Submissions are reviewed and, once approved, added to the directory via a pull request on
            GitHub. The data lives in plain JSON files — fully open and auditable.
          </p>
        </div>

        <div className="about-section">
          <h3>Who built this</h3>
          <p>
            Gray Farms was built with love by <strong>Arjun Aditya</strong> at{' '}
            <a href="https://graycup.com" target="_blank" rel="noopener noreferrer">Gray Cup</a>.
            Gray Cup builds fast, purposeful websites and digital products for businesses, farms,
            and creators.
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
          <p>Need a website for your farm or business?</p>
          <a href="/get-your-website" className="about-cta-link">
            Get your website built by Gray Cup →
          </a>
        </div>
      </div>
    </div>
  )
}
