import type { NextConfig } from "next";

const backendBaseUrl = process.env.BACKEND_INTERNAL_URL || "http://backend:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: '.next-dev',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendBaseUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
