import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output in production (for Docker)
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  images: {
    // Enable image optimization for better performance
    unoptimized: false,
    // Allow images from any domain (for OpenFoodFacts and other external sources)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  reactStrictMode: true,
  // Note: SWC minification is enabled by default in Next.js 16+
};

export default nextConfig;
