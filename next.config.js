const path = require("path"); // ← 追加

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["mobile-order-s3-bucket.s3.ap-northeast-1.amazonaws.com"],
  },
  // 型チェックとESLintをスキップする設定
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",

  // ここから追加：webpackのエイリアス設定
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },
};

module.exports = nextConfig;
