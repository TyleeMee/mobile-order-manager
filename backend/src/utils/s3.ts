// src/utils/s3.ts として作成
import { fromIni } from "@aws-sdk/credential-providers";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

// ===============================================
// === デバッグ用ログ関数の追加 (2025/05/12) ===
// ===============================================
function debugLog(message: string, data?: any) {
  const logPath = "/tmp/s3-debug.log";
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
debugLog("============= S3 MODULE LOADED =============");

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

  // 本番環境ではIAMロールに依存するため、明示的な認証情報は不要
  return config;
};

// S3クライアントの設定
export const s3Client = new S3Client(getS3ClientConfig());

// s3.ts の uploadImageToS3 関数
export const uploadImageToS3 = async (
  file: Express.Multer.File,
  userId: string,
  folderPath: string
): Promise<{ imageUrl: string; imagePath: string }> => {
  try {
    console.log("S3アップロード開始:", {
      バケット名: process.env.S3_BUCKET_NAME,
      リージョン: process.env.REGION,
      ファイル名: file.originalname,
      ファイルサイズ: file.size,
      ユーザーID: userId,
      フォルダパス: folderPath,
    });
    // デバッグログに記録
    debugLog("S3アップロード開始", {
      バケット名: process.env.S3_BUCKET_NAME,
      リージョン: process.env.REGION,
      ファイル名: file.originalname,
      ファイルサイズ: file.size,
      ユーザーID: userId,
      フォルダパス: folderPath,
    });

    const timestamp = Date.now();

    const filename = `${userId}/${timestamp}_${Buffer.from(
      file.originalname,
      "utf8"
    ).toString("hex")}`;
    const s3Path = `${folderPath}/${filename}`;

    // バッファを明示的に確認
    if (!file.buffer || file.buffer.length === 0) {
      debugLog("バッファエラー", "ファイルバッファが空または無効です");
      throw new Error("ファイルバッファが空または無効です");
    }

    console.log(`ファイルバッファサイズ: ${file.buffer.length} bytes`);
    debugLog(`ファイルバッファサイズ: ${file.buffer.length} bytes`);

    // S3にアップロード（Content-Lengthを明示的に指定）
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Path,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.buffer.length,
    };

    const uploadCommand = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(uploadCommand);

    console.log("S3アップロード結果:", result);
    debugLog("S3アップロード結果", result);

    // アップロード後に確認
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Path,
      });
      const headResult = await s3Client.send(headCommand);
      console.log("アップロード確認結果:", {
        ContentLength: headResult.ContentLength,
        ContentType: headResult.ContentType,
        ETag: headResult.ETag,
      });
      debugLog("アップロード確認結果", {
        ContentLength: headResult.ContentLength,
        ContentType: headResult.ContentType,
        ETag: headResult.ETag,
      });
    } catch (headErr) {
      console.warn("アップロード確認エラー:", headErr);
      debugLog("アップロード確認エラー", headErr);
    }

    // 公開URLを返す
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${s3Path}`;

    return {
      imageUrl,
      imagePath: s3Path,
    };
  } catch (error) {
    console.error("S3への画像アップロードに失敗:", error);
    debugLog("S3への画像アップロードに失敗", error);
    throw new Error("画像のアップロードに失敗しました");
  }
};

// =====================================================
// === uploadFileToS3関数の強化と検証追加 (2025/05/12) ===
// =====================================================
export const uploadFileToS3 = async (
  filePath: string,
  originalName: string,
  contentType: string,
  userId: string,
  folderPath: string
): Promise<{ imageUrl: string; imagePath: string }> => {
  try {
    console.log("ファイルパスからS3アップロード開始:", {
      ファイルパス: filePath,
      ファイル名: originalName,
      ContentType: contentType,
      ユーザーID: userId,
      フォルダパス: folderPath,
    });
    debugLog("ファイルパスからS3アップロード開始", {
      ファイルパス: filePath,
      ファイル名: originalName,
      ContentType: contentType,
      ユーザーID: userId,
      フォルダパス: folderPath,
    });

    // ファイルが存在することを確認
    if (!fs.existsSync(filePath)) {
      debugLog("エラー", `ファイルが存在しません: ${filePath}`);
      throw new Error(`ファイルが存在しません: ${filePath}`);
    }

    // ファイルサイズを確認
    const fileSize = fs.statSync(filePath).size;
    console.log(`ファイルサイズ: ${fileSize} bytes`);
    debugLog(`ファイルサイズ: ${fileSize} bytes`);

    if (fileSize === 0) {
      debugLog("エラー", "0バイトのファイルはアップロードできません");
      throw new Error("0バイトのファイルはアップロードできません");
    }

    // ファイルの先頭バイトを検査して画像形式を検証
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    const headerHex = buffer.toString("hex").match(/../g)?.join(" ") || "";
    console.log("S3アップロード前のファイルヘッダー:", headerHex);
    debugLog("S3アップロード前のファイルヘッダー", headerHex);

    // JPEGシグネチャの検証
    if (contentType === "image/jpeg") {
      const isValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      console.log("JPEGシグネチャチェック:", isValidJpeg ? "有効" : "無効");
      debugLog("JPEGシグネチャチェック", isValidJpeg ? "有効" : "無効");

      if (!isValidJpeg) {
        // 問題を検出したが、デバッグのためにファイルの詳細情報を表示
        console.error("警告: 無効なJPEGシグネチャです", {
          ヘッダーバイト: headerHex,
          "最初の2バイト(16進数)": `${buffer[0]
            .toString(16)
            .padStart(2, "0")} ${buffer[1].toString(16).padStart(2, "0")}`,
          "最初の2バイト(10進数)": `${buffer[0]} ${buffer[1]}`,
        });
        debugLog("警告: 無効なJPEGシグネチャです", {
          ヘッダーバイト: headerHex,
          "最初の2バイト(16進数)": `${buffer[0]
            .toString(16)
            .padStart(2, "0")} ${buffer[1].toString(16).padStart(2, "0")}`,
          "最初の2バイト(10進数)": `${buffer[0]} ${buffer[1]}`,
        });

        // バイナリモードでファイルを読み込み
        try {
          const fullFile = fs.readFileSync(filePath);
          console.log("完全なファイルサイズ:", fullFile.length);
          console.log(
            "最初の32バイト(16進数):",
            Buffer.from(fullFile.slice(0, 32))
              .toString("hex")
              .match(/../g)
              ?.join(" ")
          );
          debugLog("完全なファイルサイズと詳細", {
            サイズ: fullFile.length,
            最初の32バイト: Buffer.from(fullFile.slice(0, 32))
              .toString("hex")
              .match(/../g)
              ?.join(" "),
          });
        } catch (readErr) {
          console.error("完全なファイル読み込みエラー:", readErr);
          debugLog("完全なファイル読み込みエラー", readErr);
        }

        // 問題点について詳細なログを出力したが、一旦処理を続行
        console.warn("無効なJPEGシグネチャですが、処理を続行します");
        debugLog("無効なJPEGシグネチャですが、処理を続行します");
        // トラブルシューティングが終わったら、下記の行のコメントを外して例外をスローする
        // throw new Error('無効なJPEG画像です');
      }
    }

    // PNGシグネチャの検証
    if (contentType === "image/png") {
      const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      const isValidPng = pngSignature.every((byte, i) => buffer[i] === byte);
      console.log("PNGシグネチャチェック:", isValidPng ? "有効" : "無効");
      debugLog("PNGシグネチャチェック", isValidPng ? "有効" : "無効");

      if (!isValidPng) {
        console.error("警告: 無効なPNGシグネチャです");
        debugLog("警告: 無効なPNGシグネチャです");
        console.warn("無効なPNGシグネチャですが、処理を続行します");
        debugLog("無効なPNGシグネチャですが、処理を続行します");
        // トラブルシューティングが終わったら、下記の行のコメントを外して例外をスローする
        // throw new Error('無効なPNG画像です');
      }
    }

    // ファイルの読み込み - バイナリモードで明示的に指定
    const fileContent = fs.readFileSync(filePath, { flag: "r" });
    debugLog(`ファイル読み込み完了: ${fileContent.length} bytes`);

    // S3のキーを生成
    const timestamp = Date.now();
    const safeFileName = originalName.replace(/\s/g, "_");
    const s3Key = `${folderPath}/${userId}/${timestamp}_${safeFileName}`;

    // =====================================================
    // === アップロードパラメータの改善 (2025/05/12) ===
    // =====================================================
    // S3にアップロード - Content-Lengthを明示的に指定
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
      ContentLength: fileContent.length,
    };

    debugLog("S3アップロードパラメータ準備完了", {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
      ContentLength: fileContent.length,
    });

    const uploadCommand = new PutObjectCommand(uploadParams);
    const result = await s3Client.send(uploadCommand);

    console.log("S3アップロード結果:", result);
    debugLog("S3アップロード結果", result);

    // アップロード後の検証
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
      });
      const headResult = await s3Client.send(headCommand);
      console.log("アップロード確認結果:", {
        ContentLength: headResult.ContentLength,
        ContentType: headResult.ContentType,
        ETag: headResult.ETag,
      });
      debugLog("アップロード確認結果", {
        ContentLength: headResult.ContentLength,
        ContentType: headResult.ContentType,
        ETag: headResult.ETag,
      });

      // アップロードしたファイルのサイズを元のファイルと比較
      if (headResult.ContentLength !== fileSize) {
        console.error(
          `警告: アップロードファイルサイズの不一致 - 元: ${fileSize}, S3: ${headResult.ContentLength}`
        );
        debugLog("警告: アップロードファイルサイズの不一致", {
          元サイズ: fileSize,
          S3サイズ: headResult.ContentLength,
        });
      }
    } catch (headErr) {
      console.warn("アップロード確認エラー:", headErr);
      debugLog("アップロード確認エラー", headErr);
    }

    // 一時ファイルを削除
    try {
      fs.unlinkSync(filePath);
      console.log(`一時ファイル削除: ${filePath}`);
      debugLog(`一時ファイル削除: ${filePath}`);
    } catch (unlinkErr) {
      console.warn(`一時ファイル削除エラー: ${unlinkErr}`);
      debugLog("一時ファイル削除エラー", unlinkErr);
    }

    // URLを生成して返す
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.REGION}.amazonaws.com/${s3Key}`;
    debugLog("S3アップロード完了", {
      imageUrl,
      imagePath: s3Key,
    });

    return {
      imageUrl,
      imagePath: s3Key,
    };
  } catch (error) {
    console.error("S3への画像アップロードに失敗:", error);
    debugLog(
      "S3への画像アップロードに失敗",
      error instanceof Error ? error.message : String(error)
    );
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
    debugLog(`画像を削除しました: ${imagePath}`);
  } catch (error) {
    console.error("S3からの画像削除に失敗:", error);
    debugLog("S3からの画像削除に失敗", error);
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
    debugLog("S3接続テスト成功", result);
    return true;
  } catch (error) {
    console.error("S3接続テスト失敗:", error);
    debugLog("S3接続テスト失敗", error);
    return false;
  }
};
