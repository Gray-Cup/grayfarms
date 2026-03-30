import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Gray Farms | Find Coffee and Tea Farms of India',
  description: 'Discover coffee and tea farms across India — from Coorg and Wayanad in the south to Assam and Darjeeling in the northeast. A free, open directory.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Gray Farms',
    description: 'Discover coffee and tea farms across India.',
    images: [{ url: '/gray-farms-og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/gray-farms-og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}})()` }} />
      </head>
      <body>
        <Navbar />
        <Analytics />
        {children}
      </body>
    </html>
  )
}
