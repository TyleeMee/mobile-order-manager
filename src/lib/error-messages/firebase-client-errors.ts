import { FirebaseError } from "firebase/app";

/**
 * Firebase認証エラーの日本語マッピング
 * Firebaseクライアントから返されるエラーコードを日本語メッセージに変換します
 */
export const firebaseClientErrorMessages: Record<string, string> = {
  // 認証エラー
  "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません",
  "auth/user-disabled": "このアカウントは無効化されています",
  "auth/user-not-found": "このメールアドレスのユーザーが見つかりません",
  "auth/wrong-password": "パスワードが間違っています",
  "auth/email-already-in-use": "このメールアドレスは既に使用されています",
  "auth/invalid-email": "無効なメールアドレス形式です",
  "auth/weak-password":
    "パスワードが脆弱です。より強力なパスワードを設定してください",
  "auth/requires-recent-login": "再認証が必要です。再度ログインしてください",

  // Google認証関連エラー
  "auth/popup-closed-by-user":
    "ログインポップアップがユーザーによって閉じられました",
  "auth/cancelled-popup-request":
    "ログインポップアップリクエストがキャンセルされました",
  "auth/popup-blocked":
    "ログインポップアップがブラウザによってブロックされました",

  // その他のエラー
  "auth/too-many-requests":
    "アクセスが集中しています。しばらく経ってから再度お試しください",
  "auth/network-request-failed":
    "ネットワークエラーが発生しました。インターネット接続を確認してください",
  "auth/internal-error":
    "内部エラーが発生しました。しばらく経ってから再度お試しください",
  "auth/operation-not-allowed": "この操作は許可されていません",
};

/**
 * Firebaseエラーからエラーメッセージとエラーコードのオブジェクトを取得
 * @param error Firebaseから返されたエラー
 * @returns {message: string, code: string | null} 日本語のエラーメッセージとエラーコード
 */
export const getFirebaseErrorInfo = (
  error: unknown
): { message: string; code: string | null } => {
  // デフォルトのエラー情報
  const defaultErrorInfo = {
    message: "エラーが発生しました。もう一度お試しください",
    code: null,
  };

  // エラーがない場合はデフォルトを返す
  if (!error) return defaultErrorInfo;

  // FirebaseErrorの場合
  if (error instanceof FirebaseError) {
    return {
      message:
        firebaseClientErrorMessages[error.code] || defaultErrorInfo.message,
      code: error.code,
    };
  }

  // それ以外のエラー
  return {
    message: error instanceof Error ? error.message : defaultErrorInfo.message,
    code: null,
  };
};
