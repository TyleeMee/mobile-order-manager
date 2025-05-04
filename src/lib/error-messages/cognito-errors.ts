/**
 * Cognito認証エラーの日本語マッピング
 */
export const cognitoErrorMessages: Record<string, string> = {
  // サインアップ関連のエラー
  UsernameExistsException: "このメールアドレスは既に使用されています",
  InvalidPasswordException:
    "パスワードが脆弱です。より強力なパスワードを設定してください",
  InvalidParameterException: "無効なパラメータです",
  CodeMismatchException: "確認コードが一致しません",
  ExpiredCodeException: "確認コードの有効期限が切れています",
  TooManyRequestsException:
    "アクセスが集中しています。しばらく経ってから再度お試しください",
  LimitExceededException:
    "リクエスト制限を超えました。しばらく経ってから再度お試しください",

  // サインイン関連のエラー
  UserNotConfirmedException: "メールアドレスが確認されていません",
  UserNotFoundException: "ユーザーが見つかりません",
  NotAuthorizedException: "メールアドレスまたはパスワードが間違っています",
  PasswordResetRequiredException: "パスワードのリセットが必要です",

  // その他のエラー
  InternalErrorException: "内部エラーが発生しました",
  INVALID_LOGIN_CREDENTIALS: "ログイン情報が無効です",
  NetworkError:
    "ネットワークエラーが発生しました。インターネット接続を確認してください",
};

/**
 * Cognito認証エラーメッセージを取得する関数
 */
export const getCognitoErrorMessage = (
  errorCode: string,
  fallbackMessage: string = "認証中にエラーが発生しました"
): string => {
  return cognitoErrorMessages[errorCode] || fallbackMessage;
};
