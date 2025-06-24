import { pool } from "../config/database";

/**
 * カテゴリー順序管理のデータアクセス層
 */

// =====作成メソッド=====
// 新しいカテゴリーを順序配列に追加（末尾に追加）
export const addCategorySequence = async (
  ownerId: string,
  categoryId: string
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // 既存のレコードがあるか確認
      const checkResult = await client.query(
        "SELECT category_ids FROM category_sequence WHERE owner_id = $1",
        [ownerId]
      );

      if (checkResult.rows.length > 0) {
        // 既存のレコードがある場合は更新
        const currentIds = checkResult.rows[0].category_ids || [];
        await client.query(
          "UPDATE category_sequence SET category_ids = array_append(category_ids, $1) WHERE owner_id = $2",
          [categoryId, ownerId]
        );
      } else {
        // レコードがない場合は新規作成
        await client.query(
          "INSERT INTO category_sequence (owner_id, category_ids) VALUES ($1, $2)",
          [ownerId, [categoryId]]
        );
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("カテゴリ順序の追加に失敗しました:", error);
    throw new Error("カテゴリ順序の追加に失敗しました");
  }
};

// =====取得メソッド=====
// カテゴリ順序情報を取得
export const fetchCategorySequence = async (
  ownerId: string
): Promise<string[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT category_ids FROM category_sequence WHERE owner_id = $1",
        [ownerId]
      );

      if (result.rows.length === 0) {
        return [];
      }

      return result.rows[0].category_ids || [];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("カテゴリ順序の取得に失敗しました:", error);
    return [];
  }
};

// =====更新メソッド=====
// カテゴリー順序を更新
export const updateCategorySequence = async (
  ownerId: string,
  categoryIds: string[]
): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 既存のレコードがあるか確認
      const checkResult = await client.query(
        "SELECT id FROM category_sequence WHERE owner_id = $1",
        [ownerId]
      );

      if (checkResult.rows.length > 0) {
        // 既存のレコードがある場合は更新
        await client.query(
          "UPDATE category_sequence SET category_ids = $1 WHERE owner_id = $2",
          [categoryIds, ownerId]
        );
      } else {
        // レコードがない場合は新規作成
        await client.query(
          "INSERT INTO category_sequence (owner_id, category_ids) VALUES ($1, $2)",
          [ownerId, categoryIds]
        );
      }

      await client.query("COMMIT");
      console.log("商品カテゴリー順序を更新しました");
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("カテゴリー順序更新に失敗しました:", error);
    throw error;
  }
};

// =====削除メソッド=====
// 配列からカテゴリーIDを削除
export const deleteCategorySequence = async (
  ownerId: string,
  categoryId: string
): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      // category_idsを取得(既存のレコードがあるか確認しつつ)
      const result = await client.query(
        "SELECT category_ids FROM category_sequence WHERE owner_id = $1",
        [ownerId]
      );

      if (result.rows.length === 0) {
        console.warn(
          `カテゴリー順序情報が見つかりません（ユーザーID: ${ownerId}）`
        );
        return false;
      }

      const currentIds = result.rows[0].category_ids || [];

      // カテゴリが配列内に存在するか確認
      if (!currentIds.includes(categoryId)) {
        console.warn(
          `categorySequenceからカテゴリーID: ${categoryId} が見つかりませんでした`
        );
        return false;
      }

      // 配列から指定のカテゴリIDを削除
      await client.query(
        `UPDATE category_sequence 
         SET category_ids = array_remove(category_ids, $1)
         WHERE owner_id = $2`,
        [categoryId, ownerId]
      );

      console.log(
        `categorySequenceからカテゴリーID: ${categoryId} を削除しました`
      );
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `categorySequenceからカテゴリーID: ${categoryId} の削除に失敗しました:`,
      error
    );
    throw error;
  }
};
