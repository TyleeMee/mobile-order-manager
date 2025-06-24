"use client";

import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { ReactNode, useEffect, useState } from "react";

// Amplify設定 - v6形式
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "",
      region: process.env.REGION || "ap-northeast-1",
      loginWith: {
        email: true,
      },
    },
  },
};

export function AmplifyProvider({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window !== "undefined") {
      console.log("環境変数確認:", {
        userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
        clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        region: process.env.REGION,
      });

      // 設定が空でないことを確認する条件チェック
      if (
        !process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ||
        !process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
      ) {
        console.error("Cognito環境変数が設定されていません！");
      }
      //
      Amplify.configure(amplifyConfig);
      // 必要に応じてプロバイダーを設定
      cognitoUserPoolsTokenProvider.setAuthConfig(amplifyConfig.Auth);
      setIsConfigured(true);
    }
  }, []);

  if (!isConfigured && typeof window !== "undefined") {
    return null; // 設定完了まで何も表示しない
  }

  return <>{children}</>;
}
