import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Ensure proper build output
  output: 'standalone',
  // Optimize for Vercel
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
