import { Request, Response } from "express";
import multer from "multer";
import { ShopData } from "../models/Shop";
import {
  createShopWithImage,
  updateShopWithImage,
} from "../services/shopService";
import { fetchShop } from "../repositories/shopRepository";
import fs from "fs";
import path from "path";

// =================================================================
// ===== 追加: 画像ファイル検証関数 (2025/05/13) ===================
// =================================================================
/**
 * 画像ファイルの形式を検証する関数
 * @param filePath ファイルパス
 * @param mimetype ファイルのMIMEタイプ
 * @returns 検証結果と関連メッセージ
 */
const validateImageFile = (
  filePath: string,
  mimetype: string
): { isValid: boolean; message: string } => {
  try {
    console.log(`[検証開始] ファイル: ${filePath}, タイプ: ${mimetype}`);

    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return { isValid: false, message: `ファイルが存在しません: ${filePath}` };
    }

    // ファイルサイズを確認
    const stats = fs.statSync(filePath);
    console.log(`[検証] ファイルサイズ: ${stats.size}バイト`);

    if (stats.size === 0) {
      return {
        isValid: false,
        message: "0バイトのファイルはアップロードできません",
      };
    }

    // ファイルの先頭バイトを検査して画像形式を検証
    const buffer = Buffer.alloc(16);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    const headerHex = buffer.toString("hex").match(/../g)?.join(" ") || "";
    console.log(`[検証] 受信ファイルのヘッダー: ${headerHex}`);

    if (mimetype === "image/jpeg") {
      const isValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      console.log(
        `[検証] JPEGシグネチャチェック: ${isValidJpeg ? "✓有効" : "✗無効"}`
      );

      if (!isValidJpeg) {
        console.error(
          `[検証エラー] JPEGシグネチャが無効です: ${buffer[0]
            .toString(16)
            .padStart(2, "0")} ${buffer[1]
            .toString(16)
            .padStart(2, "0")} ≠ FF D8`
        );
        return {
          isValid: false,
          message: "無効なJPEG画像です - ファイルシグネチャが正しくありません",
        };
      }
    }

    if (mimetype === "image/png") {
      const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      const isValidPng = pngSignature.every((byte, i) => buffer[i] === byte);
      console.log(
        `[検証] PNGシグネチャチェック: ${isValidPng ? "✓有効" : "✗無効"}`
      );

      if (!isValidPng) {
        console.error(`[検証エラー] PNGシグネチャが無効です`);
        return {
          isValid: false,
          message: "無効なPNG画像です - ファイルシグネチャが正しくありません",
        };
      }
    }

    console.log(`[検証成功] ファイル形式検証に合格しました: ${filePath}`);
    return { isValid: true, message: "有効な画像ファイルです" };
  } catch (error) {
    console.error("[検証エラー] ファイル検証中に例外が発生:", error);
    return {
      isValid: false,
      message: `検証中にエラーが発生しました: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// =================================================================
// ===== 修正: multerの設定見直し (2025/05/13) =====================
// =================================================================
// 変更点: ファイル名サニタイズの追加、エラー処理の強化
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // EC2上の一時ディレクトリを使用
    const tempDir = "/tmp/uploads";
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    console.log(`[multer] アップロードディレクトリ: ${tempDir}`);
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // 追加: ファイル名をサニタイズ - 特殊文字を除去
    const originalName = file.originalname;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = uniqueSuffix + "-" + sanitizedName;
    console.log(
      `[multer] 元のファイル名: ${originalName} → 変換後: ${fileName}`
    );
    cb(null, fileName);
  },
});

// 追加: ファイルタイプとサイズのフィルタリング関数
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // ファイルタイプをチェック
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    console.log(`[multer] ファイルタイプ検証OK: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.error(`[multer] 拒否されたファイルタイプ: ${file.mimetype}`);
    cb(new Error("許可されていないファイル形式です (JPEG/PNG のみ許可)"));
  }
};

// 修正: より詳細な設定を適用したmulter設定
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB制限
  },
});

// =================================================================
// ===== 修正: ショップの新規作成ハンドラー (2025/05/13) ===========
// =================================================================
export const createShopHandler = async (req: Request, res: Response) => {
  console.log("[CREATE] ショップ作成リクエスト受信");

  // multerミドルウェアを使用して画像ファイルを処理
  upload.single("imageFile")(req, res, async (err) => {
    if (err) {
      console.error(
        `[CREATE エラー] ファイルアップロードエラー: ${err.message}`
      );
      return res
        .status(400)
        .json({ message: "ファイルアップロードエラー: " + err.message });
    }

    try {
      // ここに追加: ファイルパスの詳細な検証
      if (req.file) {
        console.log("[パス検証] アップロードファイル情報:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename,
        });

        // ファイルが実際に存在するか確認
        try {
          const fileStats = fs.statSync(req.file.path);
          console.log("[パス検証] ファイルの統計情報:", {
            size: fileStats.size,
            isFile: fileStats.isFile(),
            created: fileStats.birthtime,
            modified: fileStats.mtime,
            permissions: fileStats.mode.toString(8),
          });

          // ファイルサイズが0の場合は警告
          if (fileStats.size === 0) {
            console.error("[パス検証エラー] ファイルサイズが0です");
          }

          // ファイルの先頭バイトを読み取り
          const header = Buffer.alloc(16);
          const fd = fs.openSync(req.file.path, "r");
          fs.readSync(fd, header, 0, 16, 0);
          fs.closeSync(fd);

          console.log(
            "[パス検証] ファイルヘッダー (16バイト):",
            header.toString("hex")
          );

          // JPEGの場合、マジックナンバーを確認
          if (req.file.mimetype === "image/jpeg") {
            const isValidJpeg = header[0] === 0xff && header[1] === 0xd8;
            console.log(
              `[パス検証] JPEGシグネチャ確認: ${
                isValidJpeg ? "✓有効" : "✗無効"
              }`
            );
          }

          // PNGの場合
          if (req.file.mimetype === "image/png") {
            const pngSignature = [
              0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            ];
            const isValidPng = pngSignature.every(
              (byte, i) => header[i] === byte
            );
            console.log(
              `[パス検証] PNGシグネチャ確認: ${isValidPng ? "✓有効" : "✗無効"}`
            );
          }
        } catch (fsError) {
          console.error("[パス検証エラー] ファイル読み込みエラー:", fsError);
        }
      } else {
        console.log(
          "[パス検証] req.fileが存在しません - ファイル未アップロード"
        );
      }
      const userId = req.user?.id;
      if (!userId) {
        console.error("[CREATE エラー] 認証されていません");
        return res.status(401).json({ message: "認証されていません" });
      }
      console.log(`[CREATE] ユーザーID: ${userId}`);

      // デバッグ情報を出力
      console.log("[CREATE] リクエスト本文:", req.body);

      // 追加: アップロードされたファイルの詳細な情報をログに出力
      if (req.file) {
        console.log("[CREATE] ファイル情報:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename,
        });

        // 追加: ファイルの検証プロセス
        const validation = validateImageFile(req.file.path, req.file.mimetype);
        if (!validation.isValid) {
          console.error(`[CREATE エラー] 画像検証失敗: ${validation.message}`);

          // 一時ファイルを削除
          try {
            fs.unlinkSync(req.file.path);
            console.log(
              `[CREATE] 無効なファイルを削除しました: ${req.file.path}`
            );
          } catch (unlinkErr) {
            console.warn(`[CREATE 警告] 一時ファイル削除エラー: ${unlinkErr}`);
          }

          return res.status(400).json({
            message: `画像ファイルが無効です: ${validation.message}`,
            error: true,
          });
        }

        // 追加: 検証成功ログ
        console.log(`[CREATE 成功] 画像検証成功: ${validation.message}`);
      } else {
        console.log(
          "[CREATE] ファイルなし - 画像のアップロードはスキップされます"
        );
      }

      // フォームデータを取得
      const shopData = {
        title: req.body.title,
        description: req.body.description || null,
        prefecture: req.body.prefecture,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
        building: req.body.building || null,
        isVisible: req.body.isVisible === "true",
        isOrderAccepting: req.body.isOrderAccepting === "true",
        imageUrl: req.body.imageUrl || "",
        imagePath: req.body.imagePath || "",
      };

      console.log("[CREATE] 作成するショップデータ:", shopData);

      // サービス層を呼び出し
      console.log("[CREATE] サービス層を呼び出し中...");
      const result = await createShopWithImage(userId, shopData, req.file);

      console.log("[CREATE] サービス層の結果:", result);

      if ("error" in result) {
        console.error(`[CREATE エラー] サービス層でエラー: ${result.message}`);
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      // 追加: 成功ログ
      console.log(
        `[CREATE 成功] ショップが正常に作成されました! ID: ${result.id}`
      );
      return res.status(201).json({ id: result.id });
    } catch (error) {
      console.error("[CREATE エラー] ショップ作成エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};

// ショップの取得 - 変更なし
export const getShopHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const shop = await fetchShop(userId);

    if (!shop) {
      return res.status(404).json({ message: "店舗情報が見つかりません" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.error("ショップ取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

// =================================================================
// ===== 修正: ショップの更新ハンドラー (2025/05/13) ===============
// =================================================================
export const editShopHandler = async (req: Request, res: Response) => {
  console.log("[UPDATE] ショップ更新リクエスト受信");

  upload.single("imageFile")(req, res, async (err) => {
    if (err) {
      console.error(
        `[UPDATE エラー] ファイルアップロードエラー: ${err.message}`
      );
      return res
        .status(400)
        .json({ message: "ファイルアップロードエラー: " + err.message });
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        console.error("[UPDATE エラー] 認証されていません");
        return res.status(401).json({ message: "認証されていません" });
      }
      console.log(`[UPDATE] ユーザーID: ${userId}`);

      // デバッグ情報を出力
      console.log("[UPDATE] 更新リクエスト本文:", req.body);

      // 追加: アップロードされたファイルの詳細情報
      if (req.file) {
        console.log("[UPDATE] 更新ファイル情報:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          filename: req.file.filename,
        });

        // 追加: ファイル検証プロセス
        const validation = validateImageFile(req.file.path, req.file.mimetype);
        if (!validation.isValid) {
          console.error(
            `[UPDATE エラー] 更新画像検証失敗: ${validation.message}`
          );

          // 一時ファイルを削除
          try {
            fs.unlinkSync(req.file.path);
            console.log(
              `[UPDATE] 無効なファイルを削除しました: ${req.file.path}`
            );
          } catch (unlinkErr) {
            console.warn(`[UPDATE 警告] 一時ファイル削除エラー: ${unlinkErr}`);
          }

          return res.status(400).json({
            message: `画像ファイルが無効です: ${validation.message}`,
            error: true,
          });
        }

        // 追加: 検証成功ログ
        console.log(`[UPDATE 成功] 更新画像検証成功: ${validation.message}`);
      } else {
        console.log("[UPDATE] 更新ファイルなし - 画像の更新はスキップされます");
      }

      // フォームデータを取得
      const shopData: Partial<ShopData> = {
        title: req.body.title,
        description: req.body.description,
        prefecture: req.body.prefecture,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
        building: req.body.building,
        isVisible: req.body.isVisible === "true",
        isOrderAccepting: req.body.isOrderAccepting === "true",
        imageUrl: req.body.imageUrl,
        imagePath: req.body.imagePath,
      };

      // 不要なundefinedプロパティを削除
      Object.keys(shopData).forEach((key) => {
        if (shopData[key as keyof Partial<ShopData>] === undefined) {
          delete shopData[key as keyof Partial<ShopData>];
        }
      });

      console.log("[UPDATE] 更新するショップデータ:", shopData);

      // サービス層を呼び出し
      console.log("[UPDATE] サービス層を呼び出し中...");
      const result = await updateShopWithImage(
        userId,
        shopData,
        req.file,
        req.body.oldImagePath
      );

      console.log("[UPDATE] 更新結果:", result);

      if (!result.success) {
        console.error(`[UPDATE エラー] サービス層でエラー: ${result.message}`);
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      // 追加: 成功ログ
      console.log(`[UPDATE 成功] ショップ情報が正常に更新されました!`);
      return res
        .status(200)
        .json({ message: "店舗情報が正常に更新されました" });
    } catch (error) {
      console.error("[UPDATE エラー] ショップ更新エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};
