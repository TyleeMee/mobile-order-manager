"use client";

import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import React, { createContext, useContext, useState, useEffect } from "react";

// AmplifyのユーザータイプをAuthUserとして定義
export type AuthUser = {
  username: string;
  userId: string;
  signInDetails?: {
    loginId: string;
  };
  // 必要に応じて他の属性を追加E
};

type AuthContextType = {
  currentUser: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 初期化時にユーザー状態を確認
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user as unknown as AuthUser);
      } catch (error) {
        // ユーザーが認証されていない場合
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const logout = async () => {
    try {
      await signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("ログアウト中にエラーが発生しました:", error);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      const result = await signIn({
        username: email,
        password,
      });

      if (result.isSignedIn) {
        const user = await getCurrentUser();
        setCurrentUser(user as unknown as AuthUser);
      }
    } catch (error) {
      console.error("メールログイン中にエラーが発生しました:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        logout,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
