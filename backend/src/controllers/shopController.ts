import { Request, Response } from "express";
import multer from "multer";
import { ShopData } from "../models/Shop";
import {
  createShopWithImage,
  updateShopWithImage,
} from "../services/shopService";
import { fetchShop } from "../repositories/shopRepository";
import fs from "fs";

// multerの設定（ディスクストレージ使用）
//メモリバッファを使用する方法ではなく、一時的にファイルをディスクに保存してからS3にアップロードする方法に切り替え250511
const upload = multer({
  storage: multer.diskStorage({
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
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname.replace(/\s/g, "_"));
    },
  }),
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
      console.log("ファイル情報:", req.file);

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

      // サービス層を呼び出し
      const result = await updateShopWithImage(
        userId,
        shopData,
        req.file,
        req.body.oldImagePath
      );

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
