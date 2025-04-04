"use client";

import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
} from "firebase/auth";
import React, { createContext, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "../../firebase/client";

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<User | null>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // useAuthStateを使用してcurrentUserとloadingを取得
  const [
    currentUser,
    loading,
    // ,error
  ] = useAuthState(auth);

  //? error handlingはどうする
  const logout = async () => {
    await auth.signOut();
  };

  //TODO 以下のエラーを後ほど修正する250225
  //   Console Error

  // FirebaseError: Firebase: Error (auth/cancelled-popup-request).

  // Source
  // src/context/auth.tsx (59:42) @ Object.loginWithGoogle

  //   57 |
  //   58 |     try {
  // > 59 |       const result = await signInWithPopup(auth, provider);
  //      |                                          ^
  //   60 |       console.log("User signed in:", result.user);
  //   61 |       return result.user; // 関数の戻り値として適用される
  //   62 |     } catch (error) {
  // handleGoogleLogin
  // src/components/continue-with-google-button.tsx (17:31)
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // 同時ログイン試行を防ぐフラグ
    let isLoggingIn = false;

    try {
      // 同時ログイン試行の防止
      if (isLoggingIn) {
        console.log("ログイン処理が進行中です");
        return null;
      }

      isLoggingIn = true;

      const result = await signInWithPopup(auth, provider);
      console.log("User signed in:", result.user);
      return result.user; // 関数の戻り値として適用される
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            console.log("ログインポップアップがユーザーによって閉じられました");
            break;
          case "auth/cancelled-popup-request":
            console.log("ログインポップアップリクエストがキャンセルされました");
            break;
          case "auth/popup-blocked":
            console.error(
              "ログインポップアップがブラウザによってブロックされました"
            );
            // 必要に応じてリダイレクト方式にフォールバック
            // signInWithRedirect(auth, provider);
            break;
          default:
            console.error("予期しない認証エラー:", error);
        }
      }
      return null; // 失敗時に null を返す
    } finally {
      // ログインフラグをリセット
      isLoggingIn = false;
    }

    // await signInWithPopup(auth, provider)
    //   .then((result) => {
    //     console.log("User signed in:", result.user);
    //     return result.user;
    //   })
    //   .catch((error) => {
    //     if (error.code === "auth/popup-closed-by-user") {
    //       console.log(
    //         "The user closed the popup without completing the sign-in."
    //       );
    //     } else {
    //       console.error("Authentication error:", error);
    //     }
    //     return null;
    //   });
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: currentUser ?? null,
        loading,
        logout,
        loginWithGoogle,
        loginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
