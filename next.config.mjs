/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep a running development server from overwriting production build files.
  distDir: process.env.NODE_ENV === 'production' ? '.next-production' : '.next',
  transpilePackages: ['three'],
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }];
  },
  images: {
    formats: ['image/webp'],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      ...(process.env.NEXT_PUBLIC_SUPABASE_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname,
        pathname: '/storage/v1/object/public/site-media/**',
      }] : []),
    ],
  },
};

export default nextConfig;
