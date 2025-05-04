"use server";

import { registerUserSchema } from "@/validation/auth-user-schema";
import { addCognitoUser } from "../repositories/auth-repository";
import { getCognitoErrorMessage } from "@/lib/error-messages/cognito-errors";

// Cognitoのエラー型を定義
interface CognitoError {
  name?: string;
  code?: string;
  message?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
}

// Cognitoでユーザーを作成する関数
export const createCognitoUser = async (data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}) => {
  // 入力バリデーション
  const validation = registerUserSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    // Cognitoにユーザーを登録
    const userId = await addCognitoUser({
      displayName: data.name,
      email: data.email,
      password: data.password,
    });

    return { userId };
  } catch (error: unknown) {
    console.error("認証アカウントの作成に失敗しました:", error);

    // AWS SDK のエラー形式に対応
    let errorMessage = "アカウントの新規作成に失敗しました";

    if (error && typeof error === "object") {
      const cognitoError = error as CognitoError;

      if (cognitoError.name) {
        // AWS SDK のエラー名に基づいてエラーメッセージを決定
        switch (cognitoError.name) {
          case "UsernameExistsException":
            errorMessage = "このメールアドレスは既に使用されています";
            break;
          case "InvalidPasswordException":
            errorMessage =
              "パスワードが脆弱です。より強力なパスワードを設定してください";
            break;
          case "PasswordHistoryPolicyViolationException":
            errorMessage =
              "このパスワードは以前に使用されています。別のパスワードを設定してください";
            break;
          case "InvalidParameterException":
            errorMessage = "無効なパラメータです";
            break;
          case "TooManyRequestsException":
            errorMessage =
              "アクセスが集中しています。しばらく経ってから再度お試しください";
            break;
          default:
            // エラーメッセージからコードを推測
            if (cognitoError.message) {
              if (cognitoError.message.includes("already exists")) {
                errorMessage = "このメールアドレスは既に使用されています";
              } else if (cognitoError.message.includes("password")) {
                errorMessage =
                  "パスワードが脆弱です。より強力なパスワードを設定してください";
              }
            }
        }
      }
    }

    return {
      error: true,
      message: errorMessage,
    };
  }
};
