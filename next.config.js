/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing code...
  images: {
    // Replace this deprecated configuration:
    // domains: ['example.com', 'another-domain.com'],
    
    // With this recommended configuration:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'another-domain.com',
        pathname: '**',
      },
      // Add more patterns as needed for your domains
    ],
  },
  // ...existing code...
}

module.exports = nextConfig
