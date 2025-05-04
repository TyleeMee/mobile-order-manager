"use server";

import { fromIni } from "@aws-sdk/credential-providers";

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  MessageActionType,
  AdminCreateUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

// AWS認証情報と設定
// 環境に応じた認証情報の設定
const getClientConfig = () => {
  const config = {
    region: process.env.NEXT_PUBLIC_REGION || "ap-northeast-1",
  };

  // ローカル環境でのみプロファイルを使用
  if (process.env.NODE_ENV !== "production") {
    return {
      ...config,
      credentials: fromIni({ profile: "myprofile" }),
    };
  }

  // 本番環境ではIAMロールに依存するため、明示的な認証情報は不要
  return config;
};

// AWS認証情報と設定
const client = new CognitoIdentityProviderClient(getClientConfig());

// Cognitoユーザープールの設定
const USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";

// Cognito用のユーザー作成パラメータ型
type CreateUserParams = {
  displayName: string;
  email: string;
  password: string;
};

/**
 * Amazon Cognitoにユーザーを追加（管理者権限で）
 */
export const addCognitoUser = async (
  userData: CreateUserParams
): Promise<string> => {
  let createResponse: AdminCreateUserCommandOutput | undefined;

  try {
    // AdminCreateUserコマンドのパラメータを設定
    const createParams = {
      UserPoolId: USER_POOL_ID,
      Username: userData.email,
      TemporaryPassword: userData.password, // 一時パスワード
      MessageAction: "SUPPRESS" as MessageActionType, // 明示的な型キャスト // 確認メールを送信しない
      UserAttributes: [
        {
          Name: "email",
          Value: userData.email,
        },
        {
          Name: "email_verified",
          Value: "true", // メール検証済みとして設定
        },
        {
          Name: "name",
          Value: userData.displayName,
        },
      ],
    };

    // AdminCreateUserコマンドを実行
    const createCommand = new AdminCreateUserCommand(createParams);
    const createResponse = await client.send(createCommand);

    // 作成されたユーザーのUID (sub) を取得
    const userId = createResponse.User?.Attributes?.find(
      (attr) => attr.Name === "sub"
    )?.Value;

    if (!userId) {
      throw new Error("ユーザーIDが取得できませんでした");
    }

    // 一時パスワードを恒久的なパスワードに設定
    const passwordParams = {
      UserPoolId: USER_POOL_ID,
      Username: userData.email,
      Password: userData.password,
      Permanent: true, // 恒久的なパスワードとして設定
    };

    const passwordCommand = new AdminSetUserPasswordCommand(passwordParams);
    await client.send(passwordCommand);

    return userId;
  } catch (error) {
    console.error(
      "Cognitoユーザー作成中にエラーが発生:",
      JSON.stringify(error, null, 2)
    );

    // ユーザーは作成されたが、パスワード設定に失敗した場合、ユーザーを削除
    if (createResponse?.User?.Username) {
      try {
        const deleteParams = {
          UserPoolId: USER_POOL_ID,
          Username: userData.email,
        };
        const deleteCommand = new AdminDeleteUserCommand(deleteParams);
        await client.send(deleteCommand);
        console.log("エラー発生後にユーザーを削除しました:", userData.email);
      } catch (deleteError) {
        console.error("ユーザー削除中にエラーが発生:", deleteError);
      }
    }
    throw error;
  }
};
