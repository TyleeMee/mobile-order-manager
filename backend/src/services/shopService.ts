// S3アップロード用のサービス
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { ShopData } from "../models/Shop";
import { addShop, updateShop } from "../repositories/shopRepository";
import { formatZodError, shopSchema } from "../validation/shopSchema";

// S3クライアントの設定
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

// S3に画像をアップロードする関数
export const uploadImageToS3 = async (
  file: Express.Multer.File,
  userId: string
): Promise<{ imageUrl: string; imagePath: string }> => {
  try {
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}_${file.originalname.replace(
      /\s/g,
      "_"
    )}`;
    const s3Path = `shops/${filename}`;

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
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Path}`;

    return {
      imageUrl,
      imagePath: s3Path,
    };
  } catch (error) {
    console.error("S3への画像アップロードに失敗:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
};

// S3から画像を削除する関数
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

// ショップの作成（画像処理を含む）
export const createShopWithImage = async (
  userId: string,
  shopData: Partial<ShopData>,
  imageFile?: Express.Multer.File
): Promise<{ id: string } | { error: boolean; message: string }> => {
  try {
    // バリデーション（画像ファイルがある場合は画像URLとパスの検証をスキップ）
    const validationSchema = imageFile
      ? shopSchema.omit({ imageUrl: true, imagePath: true })
      : shopSchema;

    const validation = validationSchema.safeParse(shopData);
    if (!validation.success) {
      return formatZodError(validation.error);
    }

    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        const { imageUrl, imagePath } = await uploadImageToS3(
          imageFile,
          userId
        );
        shopData.imageUrl = imageUrl;
        shopData.imagePath = imagePath;
      } catch (error) {
        return {
          error: true,
          message:
            error instanceof Error
              ? error.message
              : "画像のアップロードに失敗しました",
        };
      }
    }

    // ショップを作成
    const shopId = await addShop(userId, shopData as ShopData);

    return { id: shopId };
  } catch (error) {
    console.error("ショップ作成エラー:", error);
    return {
      error: true,
      message:
        error instanceof Error ? error.message : "店舗の作成に失敗しました",
    };
  }
};

// ショップの更新（画像処理を含む）
export const updateShopWithImage = async (
  userId: string,
  shopData: Partial<ShopData>,
  imageFile?: Express.Multer.File,
  oldImagePath?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    // バリデーション（部分更新可能）
    const validationSchema = shopSchema.partial();
    const validation = validationSchema.safeParse(shopData);
    if (!validation.success) {
      return {
        success: false,
        message: formatZodError(validation.error).message,
      };
    }

    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        const { imageUrl, imagePath } = await uploadImageToS3(
          imageFile,
          userId
        );
        shopData.imageUrl = imageUrl;
        shopData.imagePath = imagePath;

        // 古い画像が存在する場合は削除
        if (oldImagePath && oldImagePath !== imagePath) {
          await deleteImageFromS3(oldImagePath);
        }
      } catch (error) {
        return {
          success: false,
          message:
            error instanceof Error ? error.message : "画像の処理に失敗しました",
        };
      }
    }

    // ショップを更新
    await updateShop(userId, shopData);

    return { success: true };
  } catch (error) {
    console.error("ショップ更新エラー:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "店舗の更新に失敗しました",
    };
  }
};
