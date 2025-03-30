/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unpkg.com',
      },
      {
        protocol: 'https',
        hostname: 'arxiv.org',
      },
      {
        protocol: 'https',
        hostname: 'www.w3.org',
      },
      {
        protocol: 'https',
        hostname: 'iriktekmugplhbdpwdzq.supabase.co',
      },
    ],
  },
  webpack: (config) => {
    // Enable importing PDF files
    config.module.rules.push({
      test: /\.(pdf)$/i,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;
