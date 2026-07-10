import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.premiumtechnoir.org" }],
        destination: "https://premiumtechnoir.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
