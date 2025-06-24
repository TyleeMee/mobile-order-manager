import { pool } from "../config/database";
import { Category, CategoryData } from "../models/Category";

/**
 * カテゴリーのデータアクセス層
 */

// =====作成メソッド=====
export const addCategory = async (
  userId: string,
  categoryData: CategoryData
): Promise<string> => {
  try {
    const client = await pool.connect();
    try {
      const now = new Date();
      const result = await client.query(
        `INSERT INTO categories 
         (owner_id, title, created_at, updated_at) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [userId, categoryData.title, now, now]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("カテゴリの追加に失敗しました:", error);
    throw new Error("カテゴリの追加に失敗しました");
  }
};

//=====取得メソッド=====
export const fetchCategories = async (userId: string): Promise<Category[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", title, created_at as "createdAt", updated_at as "updatedAt"
         FROM categories
         WHERE owner_id = $1`,
        [userId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        ownerId: row.ownerId,
        title: row.title,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("カテゴリの取得に失敗しました:", error);
    throw new Error("カテゴリの取得に失敗しました");
  }
};

export const fetchCategoryById = async (
  userId: string,
  categoryId: string
): Promise<Category> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", title, created_at as "createdAt", updated_at as "updatedAt"
         FROM categories
         WHERE owner_id = $1 AND id = $2`,
        [userId, categoryId]
      );

      if (result.rows.length === 0) {
        throw new Error("指定されたカテゴリが見つかりません");
      }

      return {
        id: result.rows[0].id,
        ownerId: result.rows[0].ownerId,
        title: result.rows[0].title,
        createdAt: result.rows[0].createdAt,
        updatedAt: result.rows[0].updatedAt,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`カテゴリID: ${categoryId} の取得に失敗しました:`, error);
    throw new Error("カテゴリの取得に失敗しました");
  }
};

// =====更新メソッド=====
export const updateCategory = async (
  userId: string,
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // ドキュメントの存在確認
      const checkResult = await client.query(
        "SELECT id FROM categories WHERE owner_id = $1 AND id = $2",
        [userId, categoryId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("指定された商品カテゴリーが見つかりません");
      }

      const now = new Date();
      await client.query(
        `UPDATE categories
         SET title = $1, updated_at = $2
         WHERE owner_id = $3 AND id = $4`,
        [categoryData.title, now, userId, categoryId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`カテゴリーID: ${categoryId} の更新に失敗しました:`, error);
    throw new Error("カテゴリーの更新に失敗しました");
  }
};

//=====削除メソッド=====
export const deleteCategory = async (
  userId: string,
  categoryId: string
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // ドキュメントの存在確認
      const checkResult = await client.query(
        "SELECT id FROM categories WHERE owner_id = $1 AND id = $2",
        [userId, categoryId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("指定された商品カテゴリーが見つかりません");
      }

      // カテゴリを削除
      await client.query(
        "DELETE FROM categories WHERE owner_id = $1 AND id = $2",
        [userId, categoryId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`カテゴリーID: ${categoryId} の削除に失敗しました:`, error);
    throw new Error("カテゴリーの削除に失敗しました");
  }
};
