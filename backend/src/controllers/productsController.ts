import { Request, Response } from "express";
import multer from "multer";
import {
  createProductWithImage,
  getProduct,
  getSortedProductsInCategory,
  removeProduct,
  updateProductWithImage,
} from "../services/productsService";
import { ProductData } from "../models/Product";

// Multerの設定（一時ファイル保存用）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB制限
  },
});

// 商品の新規作成（マルチパートフォームデータ対応）
export const createProductHandler = async (req: Request, res: Response) => {
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

      const categoryId = req.params.categoryId;
      if (!categoryId) {
        return res.status(400).json({ message: "カテゴリIDが必要です" });
      }

      // フォームデータを取得
      const productData = {
        title: req.body.title,
        description: req.body.description || null,
        price: parseInt(req.body.price, 10) || 0,
        isVisible: req.body.isVisible === "true",
        isOrderAccepting: req.body.isOrderAccepting === "true",
        imageUrl: req.body.imageUrl || "",
        imagePath: req.body.imagePath || "",
        categoryId: categoryId,
        ownerId: userId,
      };

      // サービス層を呼び出し
      const result = await createProductWithImage(
        userId,
        categoryId,
        productData,
        req.file
      );

      if ("error" in result && result.error) {
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      return res.status(201).json({ id: result.id });
    } catch (error) {
      console.error("商品作成エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};

// 特定のカテゴリ内の商品一覧取得
export const getProductsInCategoryHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categoryId = req.params.categoryId;
    if (!categoryId) {
      return res.status(400).json({ message: "カテゴリIDが必要です" });
    }

    const products = await getSortedProductsInCategory(userId, categoryId);
    return res.status(200).json(products);
  } catch (error) {
    console.error("商品一覧取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

// 特定の商品を取得
export const getProductHandler = async (req: Request, res: Response) => {
  try {
    // (前のコードの続き)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "商品IDが必要です" });
    }

    const product = await getProduct(userId, productId);
    if (!product) {
      return res.status(404).json({ message: "商品が見つかりません" });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("商品取得エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};

// 商品の更新（マルチパートフォームデータ対応）
export const updateProductHandler = async (req: Request, res: Response) => {
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

      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({ message: "商品IDが必要です" });
      }

      // フォームデータを取得
      const productData: Partial<ProductData> = {};

      if (req.body.categoryId) productData.categoryId = req.body.categoryId;
      if (req.body.title) productData.title = req.body.title;
      if (req.body.description !== undefined)
        productData.description = req.body.description;
      if (req.body.price !== undefined)
        productData.price = parseInt(req.body.price, 10);
      if (req.body.isVisible !== undefined)
        productData.isVisible = req.body.isVisible === "true";
      if (req.body.isOrderAccepting !== undefined)
        productData.isOrderAccepting = req.body.isOrderAccepting === "true";
      if (req.body.imageUrl) productData.imageUrl = req.body.imageUrl;
      if (req.body.imagePath) productData.imagePath = req.body.imagePath;

      // サービス層を呼び出し
      const result = await updateProductWithImage(
        userId,
        productId,
        productData,
        req.file,
        req.body.oldImagePath
      );

      if ("error" in result && result.error) {
        return res.status(400).json({
          message: result.message,
          error: true,
        });
      }

      return res
        .status(200)
        .json({ id: result.id, message: "商品が正常に更新されました" });
    } catch (error) {
      console.error("商品更新エラー:", error);
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "サーバーエラーが発生しました",
      });
    }
  });
};

// 商品の削除
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const productId = req.params.id;
    const categoryId = req.body.categoryId;
    const imagePath = req.body.imagePath;

    if (!productId) {
      return res.status(400).json({ message: "商品IDが必要です" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "カテゴリIDが必要です" });
    }

    const result = await removeProduct(
      userId,
      categoryId,
      productId,
      imagePath
    );

    if ("error" in result && result.error) {
      return res.status(400).json({
        message: result.message,
        error: true,
      });
    }

    return res.status(200).json({ message: "商品が正常に削除されました" });
  } catch (error) {
    console.error("商品削除エラー:", error);
    return res.status(500).json({
      message:
        error instanceof Error ? error.message : "サーバーエラーが発生しました",
    });
  }
};
