"use client";

import { User } from "firebase/auth";

import { useAuth } from "../context/auth-context";

// 認証済みユーザーを返すカスタムフック
export function useAuthenticatedUser(): User {
  const auth = useAuth();

  if (!auth || !auth.currentUser) {
    throw new Error("Userは認証されていません");
  }

  return auth.currentUser;
}
