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

// ファイルの検証関数を追加
const validateImageFile = (
  filePath: string,
  mimetype: string
): { isValid: boolean; message: string } => {
  try {
    // ファイルが存在するか確認
    if (!fs.existsSync(filePath)) {
      return { isValid: false, message: `ファイルが存在しません: ${filePath}` };
    }

    // ファイルサイズを確認
    const stats = fs.statSync(filePath);
    console.log(`ファイルサイズ: ${stats.size}バイト`);

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

    console.log(
      "受信ファイルのヘッダー:",
      buffer.toString("hex").match(/../g)?.join(" ")
    );

    if (mimetype === "image/jpeg") {
      const isValidJpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
      console.log("JPEGシグネチャチェック:", isValidJpeg ? "有効" : "無効");

      if (!isValidJpeg) {
        return { isValid: false, message: "無効なJPEG画像です" };
      }
    }

    if (mimetype === "image/png") {
      const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
      const isValidPng = pngSignature.every((byte, i) => buffer[i] === byte);
      console.log("PNGシグネチャチェック:", isValidPng ? "有効" : "無効");

      if (!isValidPng) {
        return { isValid: false, message: "無効なPNG画像です" };
      }
    }

    return { isValid: true, message: "有効な画像ファイルです" };
  } catch (error) {
    console.error("ファイル検証エラー:", error);
    return {
      isValid: false,
      message: `検証中にエラーが発生しました: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// multerの設定見直し
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // EC2上の一時ディレクトリを使用
    const tempDir = "/tmp/uploads";
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // ファイル名をサニタイズ
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + sanitizedName);
  },
});

// ファイルタイプとサイズの検証
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // ファイルタイプをチェック
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    console.log(`ファイルタイプ検証OK: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.error(`拒否されたファイルタイプ: ${file.mimetype}`);
    cb(new Error("許可されていないファイル形式です (JPEG/PNG のみ許可)"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB制限
  },
});

// ショップの新規作成（マルチパートフォームデータ対応）
export const createShopHandler = async (req: Request, res: Response) => {
  // multerミドルウェアを使用して画像ファイルを処理
  upload.single("imageFile")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "ファイルアップロードエラー: " + err.message });
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "認証されていません" });
      }

      // デバッグ情報を出力
      console.log("リクエスト本文:", req.body);
      if (req.file) {
        console.log("ファイル情報:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        });

        // ファイルの検証
        const validation = validateImageFile(req.file.path, req.file.mimetype);
        if (!validation.isValid) {
          console.error("画像検証エラー:", validation.message);

          // 一時ファイルを削除
          try {
            fs.unlinkSync(req.file.path);
            console.log(`無効なファイルを削除しました: ${req.file.path}`);
          } catch (unlinkErr) {
            console.warn(`一時ファイル削除エラー: ${unlinkErr}`);
          }

          return res.status(400).json({
            message: `画像ファイルが無効です: ${validation.message}`,
            error: true,
          });
        }

        console.log("画像検証成功:", validation.message);
      } else {
        console.log("ファイルなし - 画像のアップロードはスキップされます");
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

      console.log("作成するショップデータ:", shopData);

      // サービス層を呼び出し
      const result = await createShopWithImage(userId, shopData, req.file);

      console.log("サービス層の結果:", result);

      if ("error" in result) {
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      return res.status(201).json({ id: result.id });
    } catch (error) {
      console.error("ショップ作成エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};

// ショップの取得
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

// ショップの更新（マルチパートフォームデータ対応）
export const editShopHandler = async (req: Request, res: Response) => {
  upload.single("imageFile")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "ファイルアップロードエラー: " + err.message });
    }

    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "認証されていません" });
      }

      // デバッグ情報を出力
      console.log("更新リクエスト本文:", req.body);
      if (req.file) {
        console.log("更新ファイル情報:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
        });

        // ファイルの検証
        const validation = validateImageFile(req.file.path, req.file.mimetype);
        if (!validation.isValid) {
          console.error("更新画像検証エラー:", validation.message);

          // 一時ファイルを削除
          try {
            fs.unlinkSync(req.file.path);
            console.log(`無効なファイルを削除しました: ${req.file.path}`);
          } catch (unlinkErr) {
            console.warn(`一時ファイル削除エラー: ${unlinkErr}`);
          }

          return res.status(400).json({
            message: `画像ファイルが無効です: ${validation.message}`,
            error: true,
          });
        }

        console.log("更新画像検証成功:", validation.message);
      } else {
        console.log("更新ファイルなし - 画像の更新はスキップされます");
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

      console.log("更新するショップデータ:", shopData);

      // サービス層を呼び出し
      const result = await updateShopWithImage(
        userId,
        shopData,
        req.file,
        req.body.oldImagePath
      );

      console.log("更新結果:", result);

      if (!result.success) {
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      return res
        .status(200)
        .json({ message: "店舗情報が正常に更新されました" });
    } catch (error) {
      console.error("ショップ更新エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};
