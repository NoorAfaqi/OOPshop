import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from any domain by disabling optimization restrictions
    // This allows images from any source without requiring domain configuration
    unoptimized: true,
  },
};

export default nextConfig;
