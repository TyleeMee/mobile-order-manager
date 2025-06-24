"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/contexts/auth-context";

// ローディング表示用の独立したコンポーネント
const LoadingIndicator = ({ message }: { message: string }) => (
  <div className="fixed top-0 left-0 w-full h-full pt-24  bg-white bg-opacity-90 z-40 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      <div className="mt-3">{message}</div>
    </div>
  </div>
);

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // クライアントサイドでのレンダリングを確認
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 認証状態の確認
  useEffect(() => {
    // クライアントサイドでのみ実行
    if (!isClient) return;

    // 認証状態が確認できない場合は何もしない
    if (!auth) return;

    // 認証ロード中の場合は何もしない
    if (auth.loading) return;

    // ユーザーが認証されていない場合
    if (!auth.currentUser) {
      console.log("認証されていないためリダイレクト");
      router.push("/login");
      return;
    }

    // ここに到達したら認証が完了している
    // 明示的にタイムアウトを設定→LoadingIndicatorが適切なタイミングで消えないため
    const timer = setTimeout(() => {
      setAuthCheckComplete(true);
    }, 100);
  }, [auth, router, isClient]);

  // デバッグ用ログ
  useEffect(() => {
    if (isClient) {
      console.log("ProtectedRoute状態:", {
        isClient,
        authCheckComplete,
        auth: !!auth,
        loading: auth?.loading,
        currentUser: !!auth?.currentUser,
      });
    }
  }, [isClient, authCheckComplete, auth]);

  // クライアントサイドでない場合は何も表示しない（SSRを防止）
  if (!isClient) {
    return null;
  }

  // 明示的に分岐し、各条件で一つのコンポーネントだけを返す
  if (!auth) {
    return <LoadingIndicator message="認証初期化中..." />;
  }

  if (auth.loading) {
    return <LoadingIndicator message="認証確認中..." />;
  }

  if (!authCheckComplete) {
    return <LoadingIndicator message="確認中..." />;
  }

  // 認証完了済みの場合のみ子コンポーネントを表示
  return <>{children}</>;
}
