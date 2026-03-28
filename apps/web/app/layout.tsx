import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Farms Directory — Coffee & Tea Estates in India',
  description: 'A curated directory of coffee and tea farms across India.',
  openGraph: {
    title: 'Farms Directory',
    description: 'Discover coffee and tea farms across India.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1><a href="/">Farms Directory</a></h1>
          <p>Coffee &amp; Tea Estates in India</p>
          <nav className="header-right">
            <a href="https://github.com/graycup/farms-directory">Source</a>
            <span>
              Know a farm?{' '}
              <a href="/submit">Submit it</a>
            </span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
