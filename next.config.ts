import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  typescript: {
    tsconfigPath: process.env.NEXT_DIST_DIR === ".next-e2e" ? "tsconfig.e2e.json" : "tsconfig.json",
  },
};

export default nextConfig;
