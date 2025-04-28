"use client";

import { fetchAuthSession } from "aws-amplify/auth";
import { useCallback, useEffect, useState } from "react";

import { useAuthenticatedUser } from "@/hooks/use-authenticated-user-firebase";
import { useToast } from "@/hooks/use-toast";

export const useAuthToken = () => {
  const { toast } = useToast();
  const user = useAuthenticatedUser();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthToken = useCallback(async () => {
    try {
      setIsLoading(true);
      // 現在のセッションからトークンを取得
      const session = await fetchAuthSession();
      // JWTアクセストークンを取得
      const accessToken = session.tokens?.accessToken?.toString();
      setToken(accessToken || null);
      return accessToken;
    } catch (error) {
      console.error("認証トークンの取得に失敗しました:", error);
      toast({
        title: "エラー",
        description: "認証情報の取得に失敗しました。再度ログインしてください。",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // 初期ロード時にトークンを取得
  useEffect(() => {
    if (user) {
      getAuthToken();
    } else {
      setIsLoading(false);
    }
  }, [user, getAuthToken]);

  return { token, isLoading, getAuthToken };
};
