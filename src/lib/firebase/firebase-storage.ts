import { storage } from "../../../firebase/server";

// 画像アイテムの型定義
export type ImageItem = {
  url: string;
  name: string;
  fullPath: string;
  contentType?: string;
  size?: string | number;
};

/**
 * 特定のフォルダから画像URLのリストを取得する関数
 * @param folderPath Firebase Storage内のフォルダパス
 * @returns 画像メタデータの配列（URL、名前、パス）
 */
export async function getImagesFromFolder(
  folderPath: string
): Promise<ImageItem[]> {
  try {
    // フォルダ内のファイル一覧を取得
    const [files] = await storage.bucket().getFiles({
      prefix: folderPath,
    });

    // 画像ファイルのみをフィルタリング（必要に応じて）
    const imageFiles = files.filter((file) => {
      const fileName = file.name;
      return /\.(jpe?g|png|gif|webp|svg)$/i.test(fileName);
    });

    // 各画像の公開URLとメタデータを取得
    const imagePromises = imageFiles.map(async (file) => {
      // ファイルの公開URLを取得（有効期限は設定しない場合は無期限）
      const [url] = await file.getSignedUrl({
        action: "read",
        expires: "01-01-2100", // 十分に先の日付
      });

      // メタデータを取得
      const [metadata] = await file.getMetadata();

      return {
        url,
        name: file.name.split("/").pop() || "", // パスから名前部分を抽出
        fullPath: file.name,
        contentType: metadata.contentType,
        size: metadata.size,
      };
    });

    return await Promise.all(imagePromises);
  } catch (error) {
    console.error("Error getting images from Firebase Storage:", error);
    return [];
  }
}
