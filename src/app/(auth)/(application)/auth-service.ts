"use server";

import { getFirebaseErrorMessage } from "@/lib/error-messages/firebase-errors";
import { registerUserSchema } from "@/validation/auth-user-schema";

import { addFirebaseUser, addOwner } from "../(data)/auth-repository";

// Firebase Admin SDKのエラー型を定義
interface FirebaseAdminError {
  errorInfo?: {
    code?: string;
    message?: string;
  };
  codePrefix?: string;
  message?: string;
}

//Firebase Authenticationにユーザーを追加
export const createFirebaseUser = async (data: {
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
}) => {
  // 入力バリデーション (アプリケーション層の責務)
  const validation = registerUserSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    const uid = await addFirebaseUser({
      displayName: data.name,
      email: data.email,
      password: data.password,
    });

    //ownerコレクションに追加
    await createOwner(uid);

    return {};
  } catch (error: unknown) {
    console.error("認証アカウントの作成に失敗しました:", error);

    // Firebase Admin SDKのエラー形式に対応
    let errorMessage = "アカウントの新規作成に失敗しました";

    if (error && typeof error === "object") {
      const adminError = error as FirebaseAdminError;

      // errorInfoからエラーコードを取得
      if (adminError.errorInfo && adminError.errorInfo.code) {
        // errorInfo.codeを直接使用（codePrefix は付けない）
        const errorCode = adminError.errorInfo.code;
        console.log("使用するエラーコード:", errorCode);
        errorMessage = getFirebaseErrorMessage(errorCode);
      }
      // errorInfo.messageからメールアドレス重複を検知
      else if (
        adminError.errorInfo &&
        adminError.errorInfo.message &&
        adminError.errorInfo.message.includes("already in use")
      ) {
        errorMessage = "このメールアドレスは既に使用されています";
      }
    }

    console.log("返却するエラーメッセージ:", errorMessage);

    return {
      error: true,
      message: errorMessage,
    };
  }
};

//ownerコレクションに追加
export const createOwner = async (uid: string) => {
  try {
    await addOwner(uid);
  } catch (error) {
    console.error("createOwnerでエラー", error);
  }
};
