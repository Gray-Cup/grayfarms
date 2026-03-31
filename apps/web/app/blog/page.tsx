import Footer from '@/components/Footer'
import { posts } from '@/lib/posts'

export const metadata = {
  title: 'Blog — Gray Farms',
  description: 'Stories and updates from Gray Farms, a free directory of coffee and tea farms across India.',
}

export default function BlogPage() {
  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/" className="back">← Back to directory</a>
        <h2>Blog</h2>

        {posts.length === 0 ? (
          <p style={{ fontSize: 'var(--text-small)', color: '#999' }}>No posts yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {posts.map(post => (
              <div key={post.slug} className="about-section" style={{ marginBottom: 0 }}>
                <h3>
                  <a href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {post.title}
                  </a>
                </h3>
                <p style={{ color: 'var(--app-color-muted)', fontSize: 'var(--text-xsmall)', marginBottom: '0.3rem' }}>
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p>{post.description}</p>
                <a href={`/blog/${post.slug}`} style={{ fontSize: 'var(--text-xsmall)', textDecoration: 'underline' }}>
                  Read more →
                </a>
              </div>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}
