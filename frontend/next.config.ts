import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output in production (for Docker)
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  images: {
    // Allow images from any domain by disabling optimization restrictions
    // This allows images from any source without requiring domain configuration
    unoptimized: true,
  },
};

export default nextConfig;
