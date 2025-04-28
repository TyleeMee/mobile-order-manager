import { pool } from "../config/database";
import { Product, ProductData } from "../models/Product";

/**
 * 商品のデータアクセス層
 */

// =====作成メソッド=====
export const addProduct = async (
  uid: string,
  categoryId: string,
  productData: ProductData
): Promise<string> => {
  try {
    const client = await pool.connect();
    try {
      const now = new Date();
      const result = await client.query(
        `INSERT INTO products 
         (owner_id, category_id, title, image_url, image_path, description, 
          price, is_visible, is_order_accepting, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING id`,
        [
          uid,
          categoryId,
          productData.title,
          productData.imageUrl,
          productData.imagePath,
          productData.description || null,
          productData.price,
          productData.isVisible,
          productData.isOrderAccepting,
          now,
          now,
        ]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("商品の追加に失敗しました:", error);
    throw new Error("商品の追加に失敗しました");
  }
};

//=====取得メソッド=====

// 全商品取得
export const fetchProducts = async (uid: string): Promise<Product[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", category_id as "categoryId", title, 
         image_url as "imageUrl", image_path as "imagePath", description, price,
         is_visible as "isVisible", is_order_accepting as "isOrderAccepting", 
         created_at as "createdAt", updated_at as "updatedAt"
         FROM products
         WHERE owner_id = $1`,
        [uid]
      );

      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("商品の取得に失敗しました:", error);
    throw new Error("商品の取得に失敗しました");
  }
};

// カテゴリ内の商品取得
export const fetchProductsInCategory = async (
  uid: string,
  categoryId: string
): Promise<Product[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", category_id as "categoryId", title, 
         image_url as "imageUrl", image_path as "imagePath", description, price,
         is_visible as "isVisible", is_order_accepting as "isOrderAccepting", 
         created_at as "createdAt", updated_at as "updatedAt"
         FROM products
         WHERE owner_id = $1 AND category_id = $2`,
        [uid, categoryId]
      );

      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} 内の商品取得に失敗しました:`,
      error
    );
    throw new Error("カテゴリ内の商品取得に失敗しました");
  }
};

// 商品ID指定で取得
export const fetchProductById = async (
  uid: string,
  productId: string
): Promise<Product | null> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", category_id as "categoryId", title, 
         image_url as "imageUrl", image_path as "imagePath", description, price,
         is_visible as "isVisible", is_order_accepting as "isOrderAccepting", 
         created_at as "createdAt", updated_at as "updatedAt"
         FROM products
         WHERE owner_id = $1 AND id = $2`,
        [uid, productId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`商品ID: ${productId} の取得に失敗しました:`, error);
    throw new Error("商品の取得に失敗しました");
  }
};

// 商品IDからタイトルを取得
export const fetchProductTitleById = async (
  uid: string,
  productId: string
): Promise<string | null> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT title FROM products WHERE owner_id = $1 AND id = $2`,
        [uid, productId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0].title;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`商品ID: ${productId} のタイトル取得に失敗しました:`, error);
    throw new Error("商品タイトルの取得に失敗しました");
  }
};

//=====更新メソッド=====

export const updateProduct = async (
  uid: string,
  productId: string,
  productData: Partial<ProductData>
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (productData.categoryId !== undefined) {
        updateFields.push(`category_id = $${paramIndex++}`);
        values.push(productData.categoryId);
      }
      if (productData.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(productData.title);
      }
      if (productData.imageUrl !== undefined) {
        updateFields.push(`image_url = $${paramIndex++}`);
        values.push(productData.imageUrl);
      }
      if (productData.imagePath !== undefined) {
        updateFields.push(`image_path = $${paramIndex++}`);
        values.push(productData.imagePath);
      }
      if (productData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(productData.description);
      }
      if (productData.price !== undefined) {
        updateFields.push(`price = $${paramIndex++}`);
        values.push(productData.price);
      }
      if (productData.isVisible !== undefined) {
        updateFields.push(`is_visible = $${paramIndex++}`);
        values.push(productData.isVisible);
      }
      if (productData.isOrderAccepting !== undefined) {
        updateFields.push(`is_order_accepting = $${paramIndex++}`);
        values.push(productData.isOrderAccepting);
      }

      // 更新日時を追加
      updateFields.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());

      // owner_idとproductIdを追加
      values.push(uid);
      values.push(productId);

      if (updateFields.length === 0) {
        return; // 更新するフィールドがない場合は何もしない
      }

      // ドキュメントの存在確認
      const checkResult = await client.query(
        "SELECT id FROM products WHERE owner_id = $1 AND id = $2",
        [uid, productId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("指定された商品が見つかりません");
      }

      // 更新クエリを実行
      const query = `
        UPDATE products
        SET ${updateFields.join(", ")}
        WHERE owner_id = $${paramIndex++} AND id = $${paramIndex++}
      `;

      await client.query(query, values);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`商品ID: ${productId} の更新に失敗しました:`, error);
    throw new Error("商品の更新に失敗しました");
  }
};

//=====削除メソッド=====

export const deleteProduct = async (
  uid: string,
  productId: string
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // ドキュメントの存在確認
      const checkResult = await client.query(
        "SELECT id FROM products WHERE owner_id = $1 AND id = $2",
        [uid, productId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("指定された商品が見つかりません");
      }

      // 商品を削除
      await client.query(
        "DELETE FROM products WHERE owner_id = $1 AND id = $2",
        [uid, productId]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`商品ID: ${productId} の削除に失敗しました:`, error);
    throw new Error("商品の削除に失敗しました");
  }
};
