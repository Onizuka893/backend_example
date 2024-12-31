import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/", // Match the root page
        destination: "/signin", // Redirect to the signup page
        permanent: false, // Set to true for a 301 (permanent) redirect
      },
    ];
  },
};

export default nextConfig;
