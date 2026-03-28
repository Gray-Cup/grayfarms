import type { NextConfig } from 'next'

const config: NextConfig = {
  transpilePackages: ['@farms/db'],
  // Data files live at the repo root — resolved at build time via lib/farms.ts
}

export default config
