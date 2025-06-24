import { Request, Response } from "express";
import { CategoryData } from "../models/Category";
import {
  createCategory,
  editCategory,
  getCategory,
  getSortedCategories,
  removeCategory,
} from "../services/categoriesService";
import {
  categorySchema,
  categoryUpdateSchema,
  formatZodError,
} from "../validation/categorySchema";

/**
 * カテゴリーコントローラー
 * リクエスト処理とレスポンス生成を担当
 */

// カテゴリーの新規作成
export const createCategoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // 認証ミドルウェアからユーザーIDを取得
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    // Zodスキーマを使ったバリデーション
    const validation = categorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(formatZodError(validation.error));
    }

    // バリデーション済みデータを使用
    const categoryData: CategoryData = validation.data;

    const result = await createCategory(userId, categoryData);

    if (result.error) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(201).json({ id: result.id });
  } catch (error) {
    console.error("カテゴリー作成エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// カテゴリーの一覧取得
export const getCategoriesHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categories = await getSortedCategories(userId);
    return res.status(200).json(categories);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// 特定のカテゴリーを取得
export const getCategoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categoryId = req.params.id;
    const category = await getCategory(userId, categoryId);

    if (!category) {
      return res.status(404).json({ message: "カテゴリーが見つかりません" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("カテゴリー取得エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// カテゴリーの更新
export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categoryId = req.params.id;

    // 部分更新用のスキーマでバリデーション
    const validation = categoryUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(formatZodError(validation.error));
    }

    // バリデーション済みデータを使用
    const categoryData: Partial<CategoryData> = validation.data;

    const result = await editCategory(userId, categoryId, categoryData);

    if (result.error) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({ id: result.id });
  } catch (error) {
    console.error("カテゴリー更新エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};

// カテゴリーの削除
export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "認証されていません" });
    }

    const categoryId = req.params.id;
    const result = await removeCategory(userId, categoryId);

    if (result.error) {
      return res.status(400).json({ message: result.message });
    }

    return res
      .status(200)
      .json({ message: "カテゴリーが正常に削除されました" });
  } catch (error) {
    console.error("カテゴリー削除エラー:", error);
    return res.status(500).json({ message: "サーバーエラーが発生しました" });
  }
};
