import type { Metadata } from 'next'
import './globals.css'
import SubmitDialog from '@/components/SubmitDialog'

export const metadata: Metadata = {
  title: 'Gray Farms — Coffee & Tea Estates in India',
  description: 'A curated directory of coffee and tea farms across India.',
  openGraph: {
    title: 'Gray Farms',
    description: 'Discover coffee and tea farms across India.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1><a href="/">Gray Farms</a></h1>
          <p>Coffee &amp; Tea Estates in India</p>
          <nav className="header-right">
            <a href="/about">About</a>
            <a href="/impressum">Impressum</a>
            <SubmitDialog />
            <a href="https://graycup.com" target="_blank" rel="noopener noreferrer" className="graycup-btn">
              Visit Gray Cup
            </a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
