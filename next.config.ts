import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Re-enabled Next.js image optimization for WebP/AVIF conversion (REFACTOR-05 fix).
    // unoptimized: true was removed — it disabled all size/format optimization.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  // TypeScript and ESLint errors should not be silently ignored in production builds.
  // If you re-encounter build errors, fix them rather than suppressing them here.
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Strict Content Security Policy for all pages
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed by Next.js dev
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://www.goldapi.io https://api.metalpriceapi.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/db/**',
          '**/.next/**',
          '**/public/**',
          '**/node_modules/**',
          '**/prisma/**',
        ],
      };
    }
    return config;
  },
};

export default withSerwist(nextConfig);
