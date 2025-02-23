/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['draftanakitb.tech'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'draftanakitb.tech',
        port: '',
        pathname: '/**',
      },
      // Add more patterns if needed
    ],
  },
}

module.exports = nextConfig
