// src/utils/s3.ts として作成
import { fromIni } from "@aws-sdk/credential-providers";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// 環境に応じたS3クライアント設定を取得する関数
const getS3ClientConfig = () => {
  const config = {
    region: process.env.REGION || "ap-northeast-1",
  };

  // ローカル環境でのみプロファイルを使用
  if (process.env.NODE_ENV !== "production") {
    return {
      ...config,
      credentials: fromIni({ profile: "myprofile" }),
    };
  }
  // ローカル環境でのみプロファイルを使用
  if (process.env.NODE_ENV !== "production") {
    return {
      ...config,
      credentials: fromIni({ profile: "myprofile" }),
    };
  }

  // 本番環境ではIAMロールに依存するため、明示的な認証情報は不要
  return config;
  // 本番環境ではIAMロールに依存するため、明示的な認証情報は不要
  return config;
};

// S3クライアントの設定
export const s3Client = new S3Client(getS3ClientConfig());

// S3に画像をアップロードする共通関数
export const uploadImageToS3 = async (
  file: Express.Multer.File,
  userId: string,
  folderPath: string // 例: "products" または "shops"
): Promise<{ imageUrl: string; imagePath: string }> => {
  try {
    console.log("S3アップロード開始:", {
      バケット名: process.env.S3_BUCKET_NAME,
      リージョン: process.env.REGION,
      ファイル名: file.originalname,
      ユーザーID: userId,
      フォルダパス: folderPath,
    });
    //
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}_${file.originalname.replace(
      /\s/g,
      "_"
    )}`;
    const s3Path = `${folderPath}/${filename}`;

    // S3にアップロード
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Path,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3Client.send(uploadCommand);

    // 公開URLを返す
    // TODO（バケットの設定によって変わる可能性あり 特にCloudFront使用時）
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${s3Path}`;

    return {
      imageUrl,
      imagePath: s3Path,
    };
  } catch (error) {
    console.error("S3への画像アップロードに失敗:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
};

// S3から画像を削除する共通関数
export const deleteImageFromS3 = async (imagePath: string): Promise<void> => {
  try {
    if (!imagePath) return;

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: imagePath,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteCommand);
    console.log(`画像を削除しました: ${imagePath}`);
  } catch (error) {
    console.error("S3からの画像削除に失敗:", error);
    // エラーはスローせず、ログだけ残す
  }
};

// テスト用関数（確認後に削除可能）
export const testS3Connection = async () => {
  try {
    const testCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: "test-connection.txt",
      Body: Buffer.from("接続テスト"),
      ContentType: "text/plain",
    });

    const result = await s3Client.send(testCommand);
    console.log("S3接続テスト成功:", result);
    return true;
  } catch (error) {
    console.error("S3接続テスト失敗:", error);
    return false;
  }
};
