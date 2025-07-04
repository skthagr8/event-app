// next.config.js or next.config.mjs depending on your setup

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures-kenya.jijistatic.com',
        pathname: '/**', // optional: match all image paths
      },
    ],
    domains: [
      'localhost', // only necessary if using http://localhost:8000/media/...
    ],
  },
};

export default nextConfig;
