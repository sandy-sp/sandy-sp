import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  async redirects() {
    return [
      { source: "/open-source-projects", destination: "/work", permanent: true },
      { source: "/about", destination: "/journey", permanent: true },
    ];
  },
};

export default nextConfig;
