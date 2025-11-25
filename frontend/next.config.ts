import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*", // applys this rule to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", //fixes that google cross origin error
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*', //match any request starting with /api/
        destination: 'http://127.0.0.1:5001/api/:path*', //proxy to the backend server
      },
    ];
  },
};

export default nextConfig;
