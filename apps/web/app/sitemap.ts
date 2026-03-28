import type { MetadataRoute } from 'next'
import { getCoffeeFarms, getTeaFarms, toSlug } from '@/lib/farms'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grayfarms.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const all = [...getCoffeeFarms(), ...getTeaFarms()]

  const farmUrls: MetadataRoute.Sitemap = all.map(f => ({
    url: `${BASE_URL}/farms/${toSlug(f.name)}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    ...farmUrls,
  ]
}
