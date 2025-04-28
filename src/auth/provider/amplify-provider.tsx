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
