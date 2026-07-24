/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false

let repo = ''
if (isGithubActions) {
  const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.replace(/.*?\//, '') : 'Universal-Application-Genome'
  repo = `/${repoName}`
}

const nextConfig = {
  output: 'export',
  basePath: repo,
  assetPrefix: repo,
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
