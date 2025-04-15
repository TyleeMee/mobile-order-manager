"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/auth-context";

export function AuthRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // authが存在し、loadingが完了し、かつユーザーが認証されている場合にリダイレクト
    if (auth && !auth.loading && auth.currentUser) {
      router.push("/products");
    }
  }, [auth, router]);

  // 認証状態の確認中はローディング
  if (!auth || auth.loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 認証されていない場合のみログインページを表示
  if (!auth.currentUser) {
    return <>{children}</>;
  }

  // 想定外の状況（通常currentUser有りの状態でこのコードまで辿り着かない→ auth.currentUserがいる状態で初回マウントだとuseEffectが発動、currentUserがnullから有りに切り替わってもuseEffectが発動するため）
  return null;
}
