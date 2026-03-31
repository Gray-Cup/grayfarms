import Link from 'next/link'
import { Octokit } from '@octokit/rest'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'

async function getFarms() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const ref = process.env.GITHUB_BASE_BRANCH ?? 'main'

  async function readJson<T>(path: string): Promise<T[]> {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref })
    if (Array.isArray(data) || data.type !== 'file') return []
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  }

  const [coffee, tea] = await Promise.all([
    readJson<CoffeeFarmData>('data/coffee-farms.json'),
    readJson<TeaFarmData>('data/tea-farms.json'),
  ])

  return {
    coffee: coffee.filter(f => f.active),
    tea: tea.filter(f => f.active),
  }
}

export default async function FarmsPage() {
  const { coffee, tea } = await getFarms()

  return (
    <>
      <h2>Farms</h2>
      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
        {coffee.length} coffee · {tea.length} tea
      </p>

      <h3 style={{ fontSize: 'var(--text-small)', fontWeight: 600, marginBottom: '0.5rem' }}>Coffee</h3>
      <FarmTable farms={coffee} type="coffee" />

      <h3 style={{ fontSize: 'var(--text-small)', fontWeight: 600, margin: '1.5rem 0 0.5rem' }}>Tea</h3>
      <FarmTable farms={tea} type="tea" />
    </>
  )
}

function FarmTable({ farms, type }: { farms: (CoffeeFarmData | TeaFarmData)[], type: string }) {
  if (farms.length === 0) return <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-muted)' }}>No farms.</p>

  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>State</th>
          <th>City</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {farms.map(farm => (
          <tr key={farm.id}>
            <td>{farm.name}</td>
            <td>{farm.state}</td>
            <td>{farm.city}</td>
            <td>
              <Link href={`/farms/${farm.id}?type=${type}`} style={{ fontSize: 'var(--text-xsmall)' }}>
                Edit →
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
