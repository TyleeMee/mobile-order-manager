"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";

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
    //TODO 必要であればインジケーターやスケルトン　スクリーンなどに変更
    return <div>Loading...</div>;
  }

  // 認証済みの場合は子コンポーネントを表示
  if (auth.currentUser) {
    return <>{children}</>;
  }

  // 想定外の状況 - 通常はここに到達しないはず
  return <div>Authentication Required</div>;
}
