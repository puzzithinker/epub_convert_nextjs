/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use serverExternalPackages for Turbopack (Next.js 16+)
  serverExternalPackages: ['opencc'],
};

export default nextConfig;
