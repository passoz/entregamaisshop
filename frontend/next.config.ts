import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: '.next-dev',
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://host.docker.internal:8080/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
