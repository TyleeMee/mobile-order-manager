"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/auth-context";

export const useAuthToken = () => {
  const auth = useAuth();
  const user = auth?.currentUser;
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    try {
      setIsLoading(true);
      // ユーザーが認証されていない場合は早期リターン
      if (!user) {
        setToken(null);
        return null;
      }
      // 現在のセッションからトークンを取得
      const session = await fetchAuthSession();
      // JWTアクセストークンを取得
      const accessToken = session.tokens?.accessToken?.toString();
      setToken(accessToken || null);
      //
      return accessToken;
    } catch (error) {
      console.error("認証トークンの取得に失敗しました:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 初期ロード時にトークンを取得
  useEffect(() => {
    // auth.loadingの状態も考慮
    if (auth?.loading) {
      return; // まだロード中なので何もしない
    }

    if (user) {
      getAuthToken();
    } else {
      setIsLoading(false);
    }
  }, [user, getAuthToken]);

  return { token, isLoading, getAuthToken };
};
