import type { MetadataRoute } from 'next'
import { getCoffeeFarms, getTeaFarms, toSlug } from '@/lib/farms'
import { REGIONS } from '@/lib/regions'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://grayfarms.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const all = [...getCoffeeFarms(), ...getTeaFarms()]

  const farmUrls: MetadataRoute.Sitemap = all.map(f => ({
    url: `${BASE_URL}/farms/${toSlug(f.name)}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const regionUrls: MetadataRoute.Sitemap = REGIONS.map(r => ({
    url: `${BASE_URL}/region/${r.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/pages`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/sitemap`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    ...regionUrls,
    ...farmUrls,
  ]
}
