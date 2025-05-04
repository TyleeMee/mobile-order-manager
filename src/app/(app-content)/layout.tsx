import Link from "next/link";

import AuthButtons from "@/components/auth-buttons";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/auth/contexts/auth-context";
import { AmplifyProvider } from "@/auth/provider/amplify-provider";

export default function AppContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AmplifyProvider>
      <AuthProvider>
        <nav className="bg-primary text-white p-5 h-24 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
          <Link
            href="/"
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
        <div className="flex-grow">{children}</div>
        <Toaster />
      </AuthProvider>
    </AmplifyProvider>
  );
}
