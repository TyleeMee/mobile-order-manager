"use client";

import React, { useState } from "react";

import { createOwner } from "@/app/(auth)/(application)/auth-service";
import { useAuth } from "@/context/auth-context";

import { Button } from "./ui/button";

export default function ContinueWithGoogleButton() {
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!auth?.loginWithGoogle || isLoading) return;

    try {
      setIsLoading(true);
      // Googleログインを実行
      const user = await auth.loginWithGoogle();

      // ログイン成功後、初回登録のユーザーデータをFirestoreに保存
      if (user) {
        await createOwner(user.uid);
      }
    } catch (error) {
      console.error("ログインまたはユーザーデータ保存中にエラーが発生:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleGoogleLogin} disabled={isLoading} className="w-full">
      {isLoading ? "ログイン中..." : "Googleアカウントを使用する"}
    </Button>
  );
}
