import { getCoffeeFarms, getTeaFarms } from '@/lib/farms'
import DirectoryClient from '@/components/DirectoryClient'

// This page is statically generated at build time from the JSON data files.
// To add new farms, merge a PR that updates data/coffee-farms.json or data/tea-farms.json.
export const dynamic = 'force-static'

export default function HomePage() {
  const coffeeFarms = getCoffeeFarms()
  const teaFarms = getTeaFarms()

  return <DirectoryClient coffeeFarms={coffeeFarms} teaFarms={teaFarms} />
}
