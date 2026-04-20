import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span className="site-footer-brand">Gray Farms</span>
        <nav className="site-footer-links">
          <Link href="/about">About</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/impressum">Impressum</Link>
        </nav>
        <span className="site-footer-copy">
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://graycup.org" target="_blank" rel="noopener noreferrer">Gray Cup Enterprises</a>
        </span>
      </div>
    </footer>
  )
}
