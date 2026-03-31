import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Octokit } from '@octokit/rest'
import { createSupabaseServiceClient } from '@/lib/supabase-server'
import type { CoffeeFarmData, TeaFarmData, FarmContact } from '@farms/db'
import FarmEditForm from './FarmEditForm'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

async function getFarm(id: string, type: string) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })
  const owner = process.env.GITHUB_OWNER!
  const repo = process.env.GITHUB_REPO!
  const ref = process.env.GITHUB_BASE_BRANCH ?? 'main'
  const path = type === 'coffee' ? 'data/coffee-farms.json' : 'data/tea-farms.json'

  const { data } = await octokit.repos.getContent({ owner, repo, path, ref })
  if (Array.isArray(data) || data.type !== 'file') return null
  const farms: (CoffeeFarmData | TeaFarmData)[] = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  return farms.find(f => f.id === id) ?? null
}

export default async function FarmEditPage({ params, searchParams }: Props) {
  const { id } = await params
  const { type = 'coffee' } = await searchParams

  const [farm, supabase] = await Promise.all([
    getFarm(id, type),
    Promise.resolve(createSupabaseServiceClient()),
  ])

  if (!farm) notFound()

  const { data: contact } = await supabase
    .from('farm_contacts')
    .select('phone, email')
    .eq('farm_id', id)
    .single()

  return (
    <>
      <div className="breadcrumb">
        <Link href="/farms">Farms</Link> / {farm.name}
      </div>
      <h2>{farm.name}</h2>
      <span className="type-badge">{type}</span>

      <FarmEditForm
        farm={farm}
        farmType={type as 'coffee' | 'tea'}
        contact={(contact as FarmContact | null) ?? null}
      />
    </>
  )
}
