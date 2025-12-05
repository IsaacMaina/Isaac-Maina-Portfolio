import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // If Turbopack is causing environment variable loading issues, we can try disabling it
    // turbo: {
    //   rules: {},
    // },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      // Specific domain for your Supabase project
      {
        protocol: 'https',
        hostname: 'fsoevobqzmjhjhkpwfgb.supabase.co',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
