/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(self), clipboard-write=(self)",
      },
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "img-src 'self' data: blob: https:",
          "media-src 'self' blob: https:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
          "connect-src 'self' https: wss:",
          "frame-src 'self' https:",
        ].join("; "),
      },
    ]

    return [{ source: "/(.*)", headers: securityHeaders }]
  },
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
      },
      {
        protocol: "https",
        hostname: "pub-827a6341d42446508f4b4e540cd20779.r2.dev",
        pathname: "/**",
      }],
  },
}

export default nextConfig
