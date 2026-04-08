import Footer from '@/components/Footer'
import Image from "next/image"
export const metadata = {
  title: 'About — Gray Farms',
  description: 'Gray Farms is a free and open directory of coffee and tea farms across India, built by Gray Cup Enterprises Private Limited.',
}

export default function AboutPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/" className="back">← Back to directory</a>
        <h2>About Gray Farms</h2>
        <figure className="about-hero-image">
          <Image
            src="/palampur-himachal.webp"
            alt="Tea estate in Palampur, Himachal Pradesh"
            width={1500}
            height={750}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <figcaption>Tea estate in Palampur, Himachal Pradesh</figcaption>
        </figure>
        <p className="about-lead">
          Gray Farms is a free and open directory of coffee and tea farms across India —
          an initiative by{' '}
          <a href="https://graycup.org" target="_blank" rel="noopener noreferrer">Gray Cup Enterprises Private Limited</a>
          {' '}to help Indian farms get the international recognition they deserve.
        </p>

        <div className="about-section">
          <h3>Why this exists</h3>
          <p>
            India grows some of the world&apos;s finest coffee and tea, yet many of the farms
            behind these crops remain invisible to the global market. Gray Farms aims to
            change that — by giving every farm a public, discoverable presence on the web,
            completely free of charge.
          </p>
        </div>

        <div className="about-section">
          <h3>Free and open</h3>
          <p>
            This is not a marketplace. There are no listings fees, no commissions, and no
            paywalls. The data lives in plain JSON files on{' '}
            <a href="https://github.com/Gray-Cup/grayfarms" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            {' '}— fully open and auditable by anyone.
          </p>
        </div>

        <div className="about-section">
          <h3>Contact information protection</h3>
          <p>
            To protect farms from spam and automated scraping, contact details are
            gated behind a{' '}
            <a href="https://www.cloudflare.com/products/turnstile/" target="_blank" rel="noopener noreferrer">
              Cloudflare Turnstile
            </a>
            {' '}challenge. Real visitors can access the information instantly; bots cannot.
          </p>
        </div>

        <div className="about-section">
          <h3>How it works</h3>
          <p>
            Anyone can submit a farm using the Submit button on the directory. Submissions
            are reviewed and, once approved, added via a pull request on GitHub. Each listing
            includes the farm&apos;s name, location, elevation, varieties grown, processing
            methods, certifications, and a direct link to their website where available.
            All farms are pinned on an interactive map so you can explore by region.
          </p>
        </div>

        <div className="about-section">
          <h3>An initiative by Gray Cup</h3>
          <p>
            <a href="https://graycup.org" target="_blank" rel="noopener noreferrer">Gray Cup Enterprises Private Limited</a>
            {' '}is an India-based company focused on sourcing, packaging, trading, and
            exporting tea, coffee, and spices. Gray Farms is our contribution to the
            community that grows what we love — a small way of putting Indian farms
            on the world map.
          </p>
        </div>

        <div className="about-section">
          <h3>Creator</h3>
          <p>
            Gray Farms was designed and built by{' '}
            <a href="https://arjunaditya.xyz" target="_blank" rel="noopener noreferrer">Arjun Aditya</a>,
            founder of Gray Cup.
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
