import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { posts, getPost } from '@/lib/posts'

export function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Gray Farms`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <div className="layout" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <div className="form-page" style={{ height: 'auto', overflow: 'visible' }}>
        <a href="/blog" className="back">← Back to blog</a>
        <h2>{post.title}</h2>
        <p style={{ fontSize: 'var(--text-xsmall)', color: 'var(--app-color-muted)', marginBottom: '1.5rem' }}>
          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {post.content.split('\n\n').map((para, i) => (
          <div key={i} className="about-section">
            <p>{para}</p>
          </div>
        ))}

        <Footer />
      </div>
    </div>
  )
}
