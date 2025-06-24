"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/contexts/auth-context";

// ローディング表示用の独立したコンポーネント
const LoadingIndicator = () => (
  <div className="fixed top-0 left-0 w-full h-full pt-24 bg-white bg-opacity-90 z-40 flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      <div className="mt-3">読み込み中...</div>
    </div>
  </div>
);

export function AuthRoute({ children }: { children: React.ReactNode }) {
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

    // ユーザーが認証されている場合リダイレクト
    if (auth.currentUser) {
      console.log("認証済みユーザーのためリダイレクト");
      router.push("/products");
      return;
    }

    // 認証されていない場合は認証チェック完了とマーク
    setAuthCheckComplete(true);
  }, [auth, router, isClient]);

  // デバッグ用ログ
  useEffect(() => {
    if (isClient) {
      console.log("AuthRoute状態:", {
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

  // 認証オブジェクトがない場合
  if (!auth) {
    return <LoadingIndicator />;
  }

  // 認証状態ロード中の場合
  if (auth.loading) {
    return <LoadingIndicator />;
  }

  // 認証チェックが完了していない場合（この状態は通常一瞬しか続かない）
  if (!authCheckComplete) {
    return <LoadingIndicator />;
  }

  // 認証されていない場合のみログインページを表示
  if (!auth.currentUser) {
    return <>{children}</>;
  }

  // 認証済みユーザーの場合（通常ここには到達しない、リダイレクト処理中の一時的な状態）
  // useEffectでリダイレクトされるまでの間、空白画面を表示
  return <LoadingIndicator />;
}
