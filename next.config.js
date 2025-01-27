/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Increase as needed to accommodate larger videos
    },
  },
}

module.exports = nextConfig
