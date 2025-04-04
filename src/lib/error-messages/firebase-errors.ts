/**
 * Firebase認証エラーの日本語マッピング
 * Firebaseから返されるエラーコードを日本語メッセージに変換します
 */
export const firebaseErrorMessages: Record<string, string> = {
  // クライアントSDKのエラーコード
  "auth/email-already-in-use": "このメールアドレスは既に使用されています",
  "auth/invalid-email": "無効なメールアドレスです",
  "auth/operation-not-allowed": "この操作は許可されていません",
  "auth/weak-password":
    "パスワードが脆弱です。より強力なパスワードを設定してください",
  "auth/user-disabled": "このユーザーアカウントは無効化されています",
  "auth/user-not-found": "ユーザーが見つかりません",
  "auth/wrong-password": "パスワードが間違っています",
  "auth/too-many-requests":
    "アクセスが集中しています。しばらく経ってから再度お試しください",
  "auth/invalid-credential": "認証情報が無効です",

  // Admin SDKのエラーコード
  "email-already-in-use": "このメールアドレスは既に使用されています",
  "email-already-exists": "このメールアドレスは既に使用されています",
  "auth/email-already-exists": "このメールアドレスは既に使用されています",
  "invalid-email": "無効なメールアドレスです",
  "operation-not-allowed": "この操作は許可されていません",
  "weak-password":
    "パスワードが脆弱です。より強力なパスワードを設定してください",
  "user-disabled": "このユーザーアカウントは無効化されています",
  "user-not-found": "ユーザーが見つかりません",
  "wrong-password": "パスワードが間違っています",
  "too-many-requests":
    "アクセスが集中しています。しばらく経ってから再度お試しください",
  "invalid-credential": "認証情報が無効です",

  // その他のエラーコード
  INVALID_LOGIN_CREDENTIALS: "ログイン情報が無効です",
  INVALID_PASSWORD: "パスワードが無効です",
};

/**
 * Firebase認証エラーメッセージを取得する関数
 * @param errorCode エラーコード
 * @param fallbackMessage フォールバックメッセージ
 * @returns 日本語のエラーメッセージ
 */
export const getFirebaseErrorMessage = (
  errorCode: string,
  fallbackMessage: string = "アカウント作成中にエラーが発生しました"
): string => {
  // auth/ プレフィックスを削除してみる（Admin SDKではプレフィックスがない場合がある）
  const strippedCode = errorCode.replace("auth/", "");

  return (
    firebaseErrorMessages[errorCode] ||
    firebaseErrorMessages[strippedCode] ||
    fallbackMessage
  );
};
