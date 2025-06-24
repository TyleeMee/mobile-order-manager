import { pool } from "../config/database";

/**
 * 商品順序管理のデータアクセス層
 */

// =====作成メソッド=====

// 新しい商品を順序配列に追加（末尾に追加）
export const addIdToProductSequence = async (
  uid: string,
  categoryId: string,
  productId: string
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // 既存のレコードがあるか確認
      const checkResult = await client.query(
        "SELECT product_ids FROM product_sequences WHERE owner_id = $1 AND category_id = $2",
        [uid, categoryId]
      );

      if (checkResult.rows.length > 0) {
        // 既存のレコードがある場合は更新
        await client.query(
          "UPDATE product_sequences SET product_ids = array_append(product_ids, $1) WHERE owner_id = $2 AND category_id = $3",
          [productId, uid, categoryId]
        );
      } else {
        // レコードがない場合は新規作成
        await client.query(
          "INSERT INTO product_sequences (owner_id, category_id, product_ids) VALUES ($1, $2, $3)",
          [uid, categoryId, [productId]]
        );
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("商品順序の追加に失敗しました:", error);
    throw new Error("商品順序の追加に失敗しました");
  }
};

// =====取得メソッド=====

// カテゴリ内の商品順序を取得
export const fetchProductSequence = async (
  uid: string,
  categoryId: string
): Promise<string[] | null> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        "SELECT product_ids FROM product_sequences WHERE owner_id = $1 AND category_id = $2",
        [uid, categoryId]
      );

      if (result.rows.length === 0) {
        return null; // 順序情報がまだ存在しない場合
      }

      return result.rows[0].product_ids || [];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品順序取得に失敗しました:`,
      error
    );
    return null;
  }
};

// =====更新メソッド=====

// カテゴリー内の商品順序を更新
export const updateProductSequence = async (
  uid: string,
  categoryId: string,
  productIds: string[]
): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 既存のレコードがあるか確認
      const checkResult = await client.query(
        "SELECT id FROM product_sequences WHERE owner_id = $1 AND category_id = $2",
        [uid, categoryId]
      );

      if (checkResult.rows.length > 0) {
        // 既存のレコードがある場合は更新
        await client.query(
          "UPDATE product_sequences SET product_ids = $1 WHERE owner_id = $2 AND category_id = $3",
          [productIds, uid, categoryId]
        );
      } else {
        // レコードがない場合は新規作成
        await client.query(
          "INSERT INTO product_sequences (owner_id, category_id, product_ids) VALUES ($1, $2, $3)",
          [uid, categoryId, productIds]
        );
      }

      await client.query("COMMIT");
      console.log(`カテゴリID: ${categoryId} の商品順序を更新しました`);
      return true;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品順序更新に失敗しました:`,
      error
    );
    throw error;
  }
};

// =====削除メソッド=====

// 商品IDを順序から削除
export const deleteIdFromProductSequence = async (
  uid: string,
  categoryId: string,
  productId: string
): Promise<boolean> => {
  try {
    const client = await pool.connect();
    try {
      // 既存のレコードがあるか確認
      const result = await client.query(
        "SELECT product_ids FROM product_sequences WHERE owner_id = $1 AND category_id = $2",
        [uid, categoryId]
      );

      if (result.rows.length === 0) {
        console.warn(
          `商品順序情報が見つかりません（ユーザーID: ${uid}、カテゴリID: ${categoryId}）`
        );
        return false;
      }

      // 配列から指定の商品IDを削除
      await client.query(
        `UPDATE product_sequences 
         SET product_ids = array_remove(product_ids, $1)
         WHERE owner_id = $2 AND category_id = $3`,
        [productId, uid, categoryId]
      );

      console.log(
        `カテゴリーID: ${categoryId} から商品ID: ${productId} を削除しました`
      );
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `カテゴリーID: ${categoryId} から商品ID: ${productId} の削除に失敗しました:`,
      error
    );
    throw error;
  }
};

// カテゴリに関連する全商品順序情報を削除
export const deleteProductSequence = async (
  uid: string,
  categoryId: string
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // レコードを削除
      await client.query(
        "DELETE FROM product_sequences WHERE owner_id = $1 AND category_id = $2",
        [uid, categoryId]
      );

      console.log(`カテゴリーID: ${categoryId} の商品順序情報を削除しました`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `カテゴリーID: ${categoryId} の商品順序情報の削除に失敗しました:`,
      error
    );
    throw error;
  }
};
