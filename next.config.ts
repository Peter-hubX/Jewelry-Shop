import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow Next.js <Image> to heavily optimize incoming images
  images: {
    unoptimized: true,
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
