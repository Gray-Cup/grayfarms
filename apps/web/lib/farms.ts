import path from 'path'
import fs from 'fs'
import type { CoffeeFarmData, TeaFarmData } from '@farms/db'
import { toSlug } from './slug'

export { toSlug }

// Data files live at the repo root: /data/coffee-farms.json and /data/tea-farms.json
// At build time Next.js reads these from the filesystem.
// When a PR adding a new farm is merged, Vercel rebuilds the site from the updated JSON.

function readDataFile<T>(filename: string): T[] {
  // Walk up from apps/web to repo root
  const repoRoot = path.resolve(process.cwd(), '../../')
  const filePath = path.join(repoRoot, 'data', filename)
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw) as T[]
  return parsed
}

export function getCoffeeFarms(): CoffeeFarmData[] {
  return readDataFile<CoffeeFarmData>('coffee-farms.json').filter(f => f.active)
}

export function getTeaFarms(): TeaFarmData[] {
  return readDataFile<TeaFarmData>('tea-farms.json').filter(f => f.active)
}

export function findFarmBySlug(slug: string): CoffeeFarmData | TeaFarmData | null {
  const all = [...getCoffeeFarms(), ...getTeaFarms()]
  return all.find(f => toSlug(f.name) === slug) ?? null
}
