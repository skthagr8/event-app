/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.eventory-marketplace.store',
        pathname: '/media/**', // allow all media paths
      },
    ],
    domains: [
      'localhost', // for local development
      'api.eventory-marketplace.store', // allows plain <img> fallback if needed
    ],
  },
};

export default nextConfig;
