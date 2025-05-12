import fs from "fs";
import { deleteImageFromS3, uploadFileToS3 } from "@/utils/s3";
import { ShopData } from "../models/Shop";
import { addShop, updateShop } from "../repositories/shopRepository";
import { formatZodError, shopSchema } from "../validation/shopSchema";

// ===============================================
// === デバッグ用ログ関数の追加 (2025/05/12) ===
// ===============================================
function debugLog(message: string, data?: any) {
  const logPath = "/tmp/shop-service-debug.log";
  const timestamp = new Date().toISOString();
  let logMessage = `${timestamp}: ${message}`;

  if (data) {
    try {
      logMessage += ` ${JSON.stringify(data, null, 2)}`;
    } catch (e) {
      logMessage += ` [非JSONデータ: ${typeof data}]`;
    }
  }

  try {
    fs.appendFileSync(logPath, logMessage + "\n");
  } catch (err) {
    // エラーが発生しても処理を続行
  }
}

// 起動時マーカー
debugLog("============= SHOP SERVICE MODULE LOADED =============");

// ショップの作成（画像処理を含む）
export const createShopWithImage = async (
  userId: string,
  shopData: Partial<ShopData>,
  imageFile?: Express.Multer.File
): Promise<{ id: string } | { error: boolean; message: string }> => {
  try {
    console.log("サービス層: 受信したデータ", {
      userId,
      shopData,
      ファイル: imageFile
        ? {
            名前: imageFile.originalname,
            サイズ: imageFile.size,
            タイプ: imageFile.mimetype,
            パス: imageFile.path,
          }
        : "なし",
    });

    debugLog("サービス層: 受信したデータ", {
      userId,
      shopData,
      ファイル: imageFile
        ? {
            名前: imageFile.originalname,
            サイズ: imageFile.size,
            タイプ: imageFile.mimetype,
            パス: imageFile.path,
          }
        : "なし",
    });

    // バリデーション（画像ファイルがある場合は画像URLとパスの検証をスキップ）
    const validationSchema = imageFile
      ? shopSchema.omit({ imageUrl: true, imagePath: true })
      : shopSchema;

    const validation = validationSchema.safeParse(shopData);
    console.log("バリデーション結果:", validation.success ? "成功" : "失敗");
    debugLog("バリデーション結果:", validation.success ? "成功" : "失敗");

    if (!validation.success) {
      const errors = formatZodError(validation.error);
      debugLog("バリデーションエラー:", errors);
      return errors;
    }

    // ================================================
    // === 画像ファイル検証の強化（2025/05/12）===
    // ================================================
    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        // ファイルの存在を確認
        const fileStat = fs.statSync(imageFile.path);
        console.log(
          `アップロードするファイル: ${imageFile.path}, サイズ: ${fileStat.size}バイト`
        );
        debugLog("アップロードファイル情報", {
          パス: imageFile.path,
          サイズ: fileStat.size,
          最終更新日時: fileStat.mtime,
        });

        // JPEGファイルの検証（オプション）
        if (imageFile.mimetype === "image/jpeg") {
          const header = Buffer.alloc(16);
          const fd = fs.openSync(imageFile.path, "r");
          fs.readSync(fd, header, 0, 16, 0);
          fs.closeSync(fd);

          const headerHex =
            header.toString("hex").match(/../g)?.join(" ") || "";
          console.log("ファイルヘッダー (16バイト):", headerHex);
          debugLog("ファイルヘッダー (16バイト)", headerHex);

          if (header[0] !== 0xff || header[1] !== 0xd8) {
            console.error("⚠️ 警告: 無効なJPEGシグネチャです", {
              ヘッダーバイト: headerHex,
              "最初の2バイト(16進数)": `${header[0]
                .toString(16)
                .padStart(2, "0")} ${header[1].toString(16).padStart(2, "0")}`,
              "最初の2バイト(10進数)": `${header[0]} ${header[1]}`,
            });
            debugLog("⚠️ 警告: 無効なJPEGシグネチャです", {
              ヘッダーバイト: headerHex,
              "最初の2バイト(16進数)": `${header[0]
                .toString(16)
                .padStart(2, "0")} ${header[1].toString(16).padStart(2, "0")}`,
              "最初の2バイト(10進数)": `${header[0]} ${header[1]}`,
            });

            // ファイルの詳細分析
            try {
              const fullFile = fs.readFileSync(imageFile.path);
              debugLog("ファイル詳細分析", {
                全体サイズ: fullFile.length,
                最初の32バイト: Buffer.from(fullFile.slice(0, 32))
                  .toString("hex")
                  .match(/../g)
                  ?.join(" "),
              });
            } catch (readErr) {
              debugLog("ファイル詳細分析エラー", readErr);
            }
          } else {
            console.log("✓ 有効なJPEGシグネチャを確認しました");
            debugLog("✓ 有効なJPEGシグネチャを確認しました");
          }
        }

        // S3にアップロード
        console.log("S3アップロード開始");
        debugLog("S3アップロード開始");

        const result = await uploadFileToS3(
          imageFile.path,
          imageFile.originalname,
          imageFile.mimetype,
          userId,
          "shops"
        );

        console.log("S3アップロード完了:", result);
        debugLog("S3アップロード完了", result);

        shopData.imageUrl = result.imageUrl;
        shopData.imagePath = result.imagePath;
      } catch (error) {
        console.error("画像処理エラー:", error);
        debugLog(
          "画像処理エラー",
          error instanceof Error ? error.message : String(error)
        );

        return {
          error: true,
          message:
            error instanceof Error
              ? error.message
              : "画像のアップロードに失敗しました",
        };
      }
    } else {
      debugLog("画像ファイルなし - スキップします");
    }

    // ショップを作成
    debugLog("ショップ作成開始", shopData);
    const shopId = await addShop(userId, shopData as ShopData);
    debugLog("ショップ作成成功", { shopId });

    return { id: shopId };
  } catch (error) {
    console.error("ショップ作成エラー:", error);
    debugLog(
      "ショップ作成エラー",
      error instanceof Error ? error.message : String(error)
    );

    return {
      error: true,
      message:
        error instanceof Error ? error.message : "店舗の作成に失敗しました",
    };
  }
};

// ================================================
// === ショップ更新処理の強化（2025/05/12）===
// ================================================
// ショップの更新（画像処理を含む）
export const updateShopWithImage = async (
  userId: string,
  shopData: Partial<ShopData>,
  imageFile?: Express.Multer.File,
  oldImagePath?: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    debugLog("ショップ更新開始", {
      userId,
      shopData,
      ファイル: imageFile
        ? {
            名前: imageFile.originalname,
            サイズ: imageFile.size,
            タイプ: imageFile.mimetype,
            パス: imageFile.path,
          }
        : "なし",
      oldImagePath,
    });

    // バリデーション（部分更新可能）
    const validationSchema = shopSchema.partial();
    const validation = validationSchema.safeParse(shopData);

    if (!validation.success) {
      const errorMessage = formatZodError(validation.error).message;
      debugLog("更新バリデーションエラー", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    debugLog("更新バリデーション成功");

    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        // ファイルの存在を確認
        const fileStat = fs.statSync(imageFile.path);
        console.log(
          `更新用アップロードファイル: ${imageFile.path}, サイズ: ${fileStat.size}バイト`
        );
        debugLog("更新用アップロードファイル情報", {
          パス: imageFile.path,
          サイズ: fileStat.size,
          最終更新日時: fileStat.mtime,
        });

        // JPEGファイルの検証
        if (imageFile.mimetype === "image/jpeg") {
          const header = Buffer.alloc(16);
          const fd = fs.openSync(imageFile.path, "r");
          fs.readSync(fd, header, 0, 16, 0);
          fs.closeSync(fd);

          const headerHex =
            header.toString("hex").match(/../g)?.join(" ") || "";
          console.log("更新ファイルヘッダー (16バイト):", headerHex);
          debugLog("更新ファイルヘッダー (16バイト)", headerHex);

          if (header[0] !== 0xff || header[1] !== 0xd8) {
            console.error("⚠️ 警告: 無効なJPEGシグネチャです", {
              ヘッダーバイト: headerHex,
              "最初の2バイト(16進数)": `${header[0]
                .toString(16)
                .padStart(2, "0")} ${header[1].toString(16).padStart(2, "0")}`,
              "最初の2バイト(10進数)": `${header[0]} ${header[1]}`,
            });
            debugLog("⚠️ 警告: 無効なJPEGシグネチャです (更新)", {
              ヘッダーバイト: headerHex,
              "最初の2バイト(16進数)": `${header[0]
                .toString(16)
                .padStart(2, "0")} ${header[1].toString(16).padStart(2, "0")}`,
              "最初の2バイト(10進数)": `${header[0]} ${header[1]}`,
            });

            // ファイルの詳細分析
            try {
              const fullFile = fs.readFileSync(imageFile.path);
              debugLog("更新ファイル詳細分析", {
                全体サイズ: fullFile.length,
                最初の32バイト: Buffer.from(fullFile.slice(0, 32))
                  .toString("hex")
                  .match(/../g)
                  ?.join(" "),
              });
            } catch (readErr) {
              debugLog("更新ファイル詳細分析エラー", readErr);
            }
            // shopService.tsの続き
          } else {
            console.log("✓ 有効なJPEGシグネチャを確認しました (更新)");
            debugLog("✓ 有効なJPEGシグネチャを確認しました (更新)");
          }
        }

        // S3にアップロード
        console.log("更新用S3アップロード開始");
        debugLog("更新用S3アップロード開始");

        const result = await uploadFileToS3(
          imageFile.path,
          imageFile.originalname,
          imageFile.mimetype,
          userId,
          "shops"
        );

        console.log("更新用S3アップロード完了:", result);
        debugLog("更新用S3アップロード完了", result);

        shopData.imageUrl = result.imageUrl;
        shopData.imagePath = result.imagePath;

        // 古い画像が存在する場合は削除
        if (oldImagePath && oldImagePath !== result.imagePath) {
          debugLog("古い画像の削除開始", { oldImagePath });
          await deleteImageFromS3(oldImagePath);
          debugLog("古い画像の削除完了", { oldImagePath });
        }
      } catch (error) {
        console.error("画像更新処理エラー:", error);
        debugLog(
          "画像更新処理エラー",
          error instanceof Error ? error.message : String(error)
        );

        return {
          success: false,
          message:
            error instanceof Error ? error.message : "画像の処理に失敗しました",
        };
      }
    } else {
      debugLog("更新用画像ファイルなし - 画像更新をスキップします");
    }

    // ショップを更新
    debugLog("ショップ情報更新開始", shopData);
    await updateShop(userId, shopData);
    debugLog("ショップ情報更新成功");

    return { success: true };
  } catch (error) {
    console.error("ショップ更新エラー:", error);
    debugLog(
      "ショップ更新エラー",
      error instanceof Error ? error.message : String(error)
    );

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "店舗の更新に失敗しました",
    };
  }
};
