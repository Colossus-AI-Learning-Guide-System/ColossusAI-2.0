/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "another-example.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
