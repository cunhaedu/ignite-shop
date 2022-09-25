/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  newNextLinkBehavior: true,
  images: {
    domains: [
      'files.stripe.com',
    ],
  },
}

module.exports = nextConfig
