import Link from "next/link";

import AuthButtons from "@/components/auth-buttons";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";

export default function AppContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <nav className="bg-primary text-white p-5 h-24 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link
          href="/login"
          className="text-2xl tracking-widest flex gap-2 items-center uppercase"
        >
          <span>MOBILE ORDER MANAGER</span>
        </Link>
        <ul className="flex gap-6 items-center">
          <li>
            <AuthButtons />
          </li>
        </ul>
      </nav>
      {/* ヘッダーの高さ分のパディングを追加 dashboardのlayout.tsxと重ならないようにする*/}
      <div className="pt-24">{children}</div>
      <Toaster />
    </AuthProvider>
  );
}
