import { Request, Response } from "express";
import {
  addIdToProductSequence,
  fetchProductSequence,
  updateProductSequence,
  deleteIdFromProductSequence,
  deleteProductSequence,
} from "../repositories/productSequencesRepository";

/**
 * 商品順序管理のコントローラー
 */

// カテゴリ内の商品順序を取得
export const getProductSequenceHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categoryId =
      req.params.categoryId || (req.query.categoryId as string);
    if (!categoryId) {
      return res.status(400).json({ message: "カテゴリIDが必要です" });
    }

    const sequence = await fetchProductSequence(userId, categoryId);
    return res.status(200).json({ productIds: sequence || [] });
  } catch (error) {
    console.error("商品順序取得エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// 商品順序の更新
export const updateProductSequenceHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const { categoryId, productIds } = req.body;
    if (!categoryId) {
      return res.status(400).json({ message: "カテゴリIDが必要です" });
    }

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: "有効な商品ID配列が必要です" });
    }

    const result = await updateProductSequence(userId, categoryId, productIds);

    if (!result) {
      return res.status(400).json({ message: "商品順序の更新に失敗しました" });
    }

    return res.status(200).json({ message: "商品順序が正常に更新されました" });
  } catch (error) {
    console.error("商品順序更新エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};
