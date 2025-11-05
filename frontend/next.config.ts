import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*", // Apply this rule to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", //should fix that google cross origin error
          },
        ],
      },
    ];
  },
};

export default nextConfig;
