/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/server/api/:path*',
        destination: '/app/server/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig 