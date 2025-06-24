import { Request, Response } from "express";
import {
  addCategorySequence,
  fetchCategorySequence,
  updateCategorySequence,
  deleteCategorySequence,
} from "../repositories/categorySequenceRepository";

/**
 * カテゴリー順序コントローラー
 * リクエスト処理とレスポンス生成を担当
 */

// カテゴリー順序の取得
export const getCategorySequenceHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const sequence = await fetchCategorySequence(userId);
    return res.status(200).json({ categoryIds: sequence });
  } catch (error) {
    console.error("カテゴリー順序取得エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// カテゴリー順序の更新
export const updateCategorySequenceHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const { categoryIds } = req.body;
    if (!categoryIds || !Array.isArray(categoryIds)) {
      return res
        .status(400)
        .json({ message: "有効なカテゴリーID配列が必要です" });
    }

    const result = await updateCategorySequence(userId, categoryIds);

    if (!result) {
      return res
        .status(400)
        .json({ message: "カテゴリー順序の更新に失敗しました" });
    }

    return res
      .status(200)
      .json({ message: "カテゴリー順序が正常に更新されました" });
  } catch (error) {
    console.error("カテゴリー順序更新エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};
