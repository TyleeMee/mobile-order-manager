import "./globals.css";

import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"], // 一般的なweightだけに制限
  display: "swap",
  preload: false, // プリロードを無効化
});

export const metadata: Metadata = {
  title: "Mobile Order Manager",
  description: "Manager app for to-go mobile order",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${notoSansJP.className} antialiased`}>{children}</body>
    </html>
  );
}
