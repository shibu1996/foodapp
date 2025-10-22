/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@restaurant-app/api-client', '@restaurant-app/design-tokens'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@restaurant-app/api-client': require('path').resolve(__dirname, '../../packages/api-client/src'),
      '@restaurant-app/design-tokens': require('path').resolve(__dirname, '../../packages/design-tokens'),
    }
    return config
  },
}

module.exports = nextConfig

