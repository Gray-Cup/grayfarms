export type Post = {
  slug: string
  title: string
  date: string
  description: string
  content: string
}

export const posts: Post[] = [
  {
    slug: 'introducing-gray-farms',
    title: 'Introducing Gray Farms',
    date: '2025-12-01',
    description: 'A free and open directory of coffee and tea farms across India.',
    content: `Gray Farms is a free and open directory of coffee and tea farms across India — an initiative by Gray Cup Enterprises Private Limited to help Indian farms get the international recognition they deserve.

India grows some of the world's finest coffee and tea, yet many of the farms behind these crops remain invisible to the global market. Gray Farms aims to change that by giving every farm a public, discoverable presence on the web, completely free of charge.

The data lives in plain JSON files on GitHub — fully open and auditable by anyone. Anyone can submit a farm using the Submit button on the directory. Submissions are reviewed and, once approved, added via a pull request.`,
  },
]

export function getPost(slug: string): Post | undefined {
  return posts.find(p => p.slug === slug)
}
