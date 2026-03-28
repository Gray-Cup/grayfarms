// Copies static assets from the repo root's /static folder into apps/web/public
// so Next.js can serve them. Runs automatically before `next build` and `next dev`.
const fs = require('fs')
const path = require('path')

const repoRoot = path.resolve(__dirname, '../../../')
const publicDir = path.resolve(__dirname, '../public')

const assets = [
  'india.geojson',
  'favicon.svg',
  'thumb.jpg',
]

fs.mkdirSync(publicDir, { recursive: true })

for (const asset of assets) {
  const src = path.join(repoRoot, 'static', asset)
  const dest = path.join(publicDir, asset)
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest)
    console.log(`Copied: ${asset}`)
  } else {
    console.warn(`Warning: ${src} not found, skipping`)
  }
}
