import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // {
      //   protocol: "https", // https のみ許可
      //   hostname: "lh3.googleusercontent.com", // Google の画像 CDN
      // },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // Firebase Storage の画像
      },
    ],
  },
};

export default nextConfig;
