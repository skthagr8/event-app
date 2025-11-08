/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,    // recommended for catching potential bugs
  output: "standalone",     // required for Render deployment

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pictures-kenya.jijistatic.com',
        pathname: '/**', // allow all image paths
      },
    ],
    domains: [
      'localhost', // only needed for local development
    ],
  },

  // If you ever deploy on a subpath (not root), uncomment these:
  // basePath: "",
  // assetPrefix: "",
};

export default nextConfig;
