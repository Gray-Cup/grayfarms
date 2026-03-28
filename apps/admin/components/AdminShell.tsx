'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link href={href} className={isActive ? 'active' : ''}>
      {children}
    </Link>
  )
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't render the shell on the login page
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      <header className="admin-header">
        <h1><Link href="/">Farms Directory</Link></h1>
        <span style={{ fontSize: 'var(--text-xsmall)', color: 'var(--color-muted)' }}>Admin</span>
        <nav className="header-right">
          <Link href="/" style={{ color: 'var(--color-muted)', fontSize: 'var(--text-xsmall)' }}>
            ← Public site
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 'var(--text-xsmall)', color: 'var(--color-muted)', padding: 0,
              }}
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <div className="admin-shell">
        <nav className="admin-nav">
          <div className="nav-section">Overview</div>
          <NavLink href="/">Dashboard</NavLink>

          <div className="nav-section">Reviews</div>
          <NavLink href="/submissions">Submissions</NavLink>
        </nav>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  )
}
