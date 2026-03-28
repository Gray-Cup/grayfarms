import { Octokit } from '@octokit/rest'
import type { Submission } from '@farms/db'

const OWNER = process.env.GITHUB_OWNER!
const REPO  = process.env.GITHUB_REPO!
const BASE_BRANCH = process.env.GITHUB_BASE_BRANCH ?? 'main'

function getDataFilePath(farmType: 'coffee' | 'tea') {
  return farmType === 'coffee' ? 'data/coffee-farms.json' : 'data/tea-farms.json'
}

function buildFarmEntry(submission: Submission) {
  const base = {
    id: submission.id,
    name: submission.name,
    state: submission.state,
    city: submission.city,
    address: submission.address,
    pincode: submission.pincode,
    lat: submission.lat,
    lng: submission.lng,
    url: submission.url,
    description: submission.description,
    elevation_meters: submission.elevation_meters,
    processing_methods: submission.processing_methods,
    certifications: submission.certifications,
    active: true,
  }

  if (submission.farm_type === 'coffee') {
    return { ...base, varieties: submission.varieties }
  } else {
    return { ...base, tea_types: submission.tea_types }
  }
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50)
}

export async function createFarmPullRequest(submission: Submission): Promise<string> {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

  const dataFile = getDataFilePath(submission.farm_type)

  // 1. Get current file content and SHA
  const { data: fileData } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: dataFile,
    ref: BASE_BRANCH,
  })

  if (Array.isArray(fileData) || fileData.type !== 'file') {
    throw new Error(`Expected a file at ${dataFile}`)
  }

  const currentJson = Buffer.from(fileData.content, 'base64').toString('utf-8')
  const farms: object[] = JSON.parse(currentJson)

  // 2. Append new farm entry
  farms.push(buildFarmEntry(submission))
  const updatedJson = JSON.stringify(farms, null, 2) + '\n'

  // 3. Create a new branch from main
  const { data: mainRef } = await octokit.git.getRef({
    owner: OWNER,
    repo: REPO,
    ref: `heads/${BASE_BRANCH}`,
  })

  const branchName = `add-farm/${submission.farm_type}/${slugify(submission.name)}-${submission.id.slice(0, 8)}`

  await octokit.git.createRef({
    owner: OWNER,
    repo: REPO,
    ref: `refs/heads/${branchName}`,
    sha: mainRef.object.sha,
  })

  // 4. Commit the updated file to the new branch
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: dataFile,
    message: `Add ${submission.farm_type} farm: ${submission.name} (${submission.city}, ${submission.state})`,
    content: Buffer.from(updatedJson).toString('base64'),
    sha: fileData.sha,
    branch: branchName,
  })

  // 5. Open the pull request
  const body = [
    `## New ${submission.farm_type === 'coffee' ? 'Coffee Farm' : 'Tea Estate'}: ${submission.name}`,
    '',
    `- **State:** ${submission.state}`,
    `- **City:** ${submission.city}`,
    submission.address ? `- **Address:** ${submission.address}` : null,
    submission.lat != null ? `- **Coordinates:** ${submission.lat}, ${submission.lng}` : null,
    submission.elevation_meters ? `- **Elevation:** ${submission.elevation_meters}m` : null,
    submission.url ? `- **Website:** ${submission.url}` : null,
    '',
    submission.description ? `### Description\n${submission.description}` : null,
    '',
    '---',
    `*Approved from admin panel. Submission ID: \`${submission.id}\`*`,
  ].filter(line => line !== null).join('\n')

  const { data: pr } = await octokit.pulls.create({
    owner: OWNER,
    repo: REPO,
    title: `Add ${submission.farm_type} farm: ${submission.name}`,
    body,
    head: branchName,
    base: BASE_BRANCH,
  })

  return pr.html_url
}
