/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Allow images from external domains
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'localhost',
    ],
  },

  // API rewrites (proxy to backend)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;






