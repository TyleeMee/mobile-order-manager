"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context-firebase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // loadingが完了し、かつユーザーが認証されていない場合にリダイレクト
    if (auth && !auth.loading && !auth.currentUser) {
      setIsRedirecting(true); // リダイレクト中のフラグを設定
      router.push("/login");
    }
  }, [auth, router]);

  // ローディング中、リダイレクト中、またはauthが未初期化の場合はローディング表示
  if (!auth || auth.loading || isRedirecting) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 認証済みの場合は子コンポーネントを表示
  if (auth.currentUser) {
    return <>{children}</>;
  }

  // 想定外の状況 - 通常はここに到達しないはず
  return <div>Authentication Required</div>;
}
