"use client";

import { useAuth } from "../context/auth-context";
import { AuthUser } from "../context/auth-context";

// 認証済みユーザーを返すカスタムフック
export function useAuthenticatedUser(): AuthUser {
  const auth = useAuth();

  if (!auth || !auth.currentUser) {
    throw new Error("Userは認証されていません");
  }

  return auth.currentUser;
}
