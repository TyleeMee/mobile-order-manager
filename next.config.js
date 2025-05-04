/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["mobile-order-s3-bucket.s3.ap-northeast-1.amazonaws.com"],
  },
  // 型チェックとESLintをスキップする設定
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
