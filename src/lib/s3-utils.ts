// lib/aws/s3-utils.ts
import { fromIni } from "@aws-sdk/credential-providers";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 画像データの型定義
export interface ImageData {
  name: string;
  key: string;
  url: string;
  lastModified?: Date;
  imagePath?: string;
}

// 画像アップロード結果の型定義
export interface UploadResult {
  imageUrl: string;
  imagePath: string;
}

// 環境に応じたS3クライアント設定を取得する関数
const getS3ClientConfig = () => {
  const config = {
    region: process.env.AWS_REGION || "ap-northeast-1",
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

// S3クライアントの設定
export const s3Client = new S3Client(getS3ClientConfig());

/**
 * 指定されたS3バケットとフォルダパスから画像を取得する
 * @param {string} folderPath - S3バケット内のフォルダパス (例: "home/")
 * @returns {Promise<ImageData[]>} - 画像オブジェクトの配列
 */
export async function getImagesFromS3Folder(
  folderPath: string
): Promise<ImageData[]> {
  try {
    console.log(`S3フォルダ '${folderPath}' から画像を取得中...`);

    // ListObjectsV2Commandを使用してフォルダ内のオブジェクトを一覧表示
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME || "",
      Prefix: folderPath,
    });

    const { Contents } = await s3Client.send(listCommand);

    // オブジェクトが見つからない場合は空の配列を返す
    if (!Contents || Contents.length === 0) {
      console.log(`${folderPath} にオブジェクトが見つかりませんでした`);
      return [];
    }

    // 画像ファイルのみをフィルタリング
    const imageFiles = Contents.filter((item: _Object) => {
      if (!item.Key) return false;

      const key = item.Key.toLowerCase();
      return (
        key.endsWith(".jpg") ||
        key.endsWith(".jpeg") ||
        key.endsWith(".png") ||
        key.endsWith(".gif") ||
        key.endsWith(".webp")
      );
    });

    // 各画像ファイルのURLを生成
    const imageData = await Promise.all(
      imageFiles.map(async (file: _Object) => {
        if (!file.Key) {
          throw new Error("ファイルキーが見つかりません");
        }

        // 署名付きURLを生成（有効期限は1時間）
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || "",
          Key: file.Key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        const imageData: ImageData = {
          name: file.Key.split("/").pop() || "",
          key: file.Key,
          url: url,
          lastModified: file.LastModified,
          imagePath: file.Key,
        };

        return imageData;
      })
    );

    console.log(
      `${folderPath} から ${imageData.length} 個の画像を取得しました`
    );
    return imageData;
  } catch (error) {
    console.error("S3から画像を取得中にエラーが発生しました:", error);
    return [];
  }
}
