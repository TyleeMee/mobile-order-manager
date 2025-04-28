import { pool } from "../config/database";
import { Shop, ShopData } from "../models/Shop";

/**
 * ショップのデータアクセス層
 */

// =====作成メソッド=====
export const addShop = async (
  userId: string,
  shopData: ShopData
): Promise<string> => {
  try {
    const client = await pool.connect();
    try {
      // 既存のショップがあるか確認
      const checkResult = await client.query(
        "SELECT id FROM shops WHERE owner_id = $1",
        [userId]
      );

      if (checkResult.rows.length > 0) {
        throw new Error(
          "店舗情報はすでに存在します。更新するには updateShop を使用してください。"
        );
      }

      const now = new Date();
      const result = await client.query(
        `INSERT INTO shops 
         (owner_id, title, image_url, image_path, description, prefecture, city, 
          street_address, building, is_visible, is_order_accepting, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
         RETURNING id`,
        [
          userId,
          shopData.title,
          shopData.imageUrl,
          shopData.imagePath,
          shopData.description || null,
          shopData.prefecture,
          shopData.city,
          shopData.streetAddress,
          shopData.building || null,
          shopData.isVisible,
          shopData.isOrderAccepting,
          now,
          now,
        ]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("店舗情報の作成に失敗しました:", error);
    throw new Error("店舗情報の作成に失敗しました");
  }
};

//=====取得メソッド=====
export const fetchShop = async (userId: string): Promise<Shop | null> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id as "ownerId", title, image_url as "imageUrl", 
         image_path as "imagePath", description, prefecture, city, 
         street_address as "streetAddress", building, is_visible as "isVisible", 
         is_order_accepting as "isOrderAccepting", created_at as "createdAt", updated_at as "updatedAt"
         FROM shops
         WHERE owner_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return {
        id: result.rows[0].id,
        ownerId: result.rows[0].ownerId,
        title: result.rows[0].title,
        imageUrl: result.rows[0].imageUrl,
        imagePath: result.rows[0].imagePath,
        description: result.rows[0].description,
        prefecture: result.rows[0].prefecture,
        city: result.rows[0].city,
        streetAddress: result.rows[0].streetAddress,
        building: result.rows[0].building,
        isVisible: result.rows[0].isVisible,
        isOrderAccepting: result.rows[0].isOrderAccepting,
        createdAt: result.rows[0].createdAt,
        updatedAt: result.rows[0].updatedAt,
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("店舗情報の取得に失敗しました:", error);
    throw new Error("店舗情報の取得に失敗しました");
  }
};

// =====更新メソッド=====
export const updateShop = async (
  userId: string,
  shopData: Partial<ShopData>
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      // 店舗の存在確認
      const checkResult = await client.query(
        "SELECT id FROM shops WHERE owner_id = $1",
        [userId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("店舗情報が見つかりません");
      }

      const shopId = checkResult.rows[0].id;

      // 更新するフィールドを動的に構築
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // 更新するフィールドがある場合のみ追加
      if (shopData.title !== undefined) {
        updateFields.push(`title = $${paramIndex++}`);
        values.push(shopData.title);
      }
      if (shopData.imageUrl !== undefined) {
        updateFields.push(`image_url = $${paramIndex++}`);
        values.push(shopData.imageUrl);
      }
      if (shopData.imagePath !== undefined) {
        updateFields.push(`image_path = $${paramIndex++}`);
        values.push(shopData.imagePath);
      }
      if (shopData.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        values.push(shopData.description);
      }
      if (shopData.prefecture !== undefined) {
        updateFields.push(`prefecture = $${paramIndex++}`);
        values.push(shopData.prefecture);
      }
      if (shopData.city !== undefined) {
        updateFields.push(`city = $${paramIndex++}`);
        values.push(shopData.city);
      }
      if (shopData.streetAddress !== undefined) {
        updateFields.push(`street_address = $${paramIndex++}`);
        values.push(shopData.streetAddress);
      }
      if (shopData.building !== undefined) {
        updateFields.push(`building = $${paramIndex++}`);
        values.push(shopData.building);
      }
      if (shopData.isVisible !== undefined) {
        updateFields.push(`is_visible = $${paramIndex++}`);
        values.push(shopData.isVisible);
      }
      if (shopData.isOrderAccepting !== undefined) {
        updateFields.push(`is_order_accepting = $${paramIndex++}`);
        values.push(shopData.isOrderAccepting);
      }

      // 更新日時を追加
      const now = new Date();
      updateFields.push(`updated_at = $${paramIndex++}`);
      values.push(now);

      // owner_idとshopIdを追加
      values.push(userId);
      values.push(shopId);

      if (updateFields.length > 0) {
        const query = `
          UPDATE shops
          SET ${updateFields.join(", ")}
          WHERE owner_id = $${paramIndex++} AND id = $${paramIndex++}
        `;

        await client.query(query, values);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`店舗情報の更新に失敗しました:`, error);
    throw new Error("店舗情報の更新に失敗しました");
  }
};
