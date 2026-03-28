import { notFound } from 'next/navigation'
import { getCoffeeFarms, getTeaFarms, findFarmBySlug, toSlug, stripContact } from '@/lib/farms'
import DirectoryClient from '@/components/DirectoryClient'

export function generateStaticParams() {
  const all = [...getCoffeeFarms(), ...getTeaFarms()]
  return all.map(f => ({ slug: toSlug(f.name) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const farm = findFarmBySlug(slug)
  if (!farm) return {}
  return {
    title: `${farm.name} — Gray Farms`,
    description: farm.description ?? `${farm.name} is a ${farm.city}, ${farm.state} farm listed on Gray Farms.`,
  }
}

export default async function FarmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const farm = findFarmBySlug(slug)
  if (!farm) notFound()

  return (
    <DirectoryClient
      coffeeFarms={stripContact(getCoffeeFarms())}
      teaFarms={stripContact(getTeaFarms())}
      initialFarmId={farm.id}
    />
  )
}
