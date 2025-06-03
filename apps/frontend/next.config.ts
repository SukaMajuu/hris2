import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['images.pexels.com', 'tvnnyjcbaomhjksrgjpl.supabase.co'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/landing-page',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
