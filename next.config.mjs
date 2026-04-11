/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'entynmpvbjrwafeysxze.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      }],
  },
}

export default nextConfig
