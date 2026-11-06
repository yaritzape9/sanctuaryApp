import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint runs as its own CI step (npm run lint), so builds don't repeat it
  // or fail on lint while trying something locally
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
