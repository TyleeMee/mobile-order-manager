import { pool } from "../config/database";
import {
  Order,
  OrderData,
  OrderID,
  OrderStatus,
  OrderWithProductTitles,
} from "../models/Order";
import { orderStatusFromString } from "../models/Order";
import { ProductID } from "../models/Product";

/**
 * 注文のデータアクセス層
 */

// =====ヘルパー関数=====

/**
 * レコードからOrderオブジェクトに変換する関数
 */
const toOrder = (row: any): Order => {
  return {
    id: row.id,
    ownerId: row.owner_id,
    userId: row.user_id,
    pickupId: row.pickup_id,
    items: row.items,
    productIds: row.product_ids,
    orderStatus: orderStatusFromString(row.order_status),
    orderDate: row.order_date,
    total: row.total,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// =====作成メソッド=====

/**
 * 注文を作成する
 */
export const createOrder = async (orderData: OrderData): Promise<OrderID> => {
  try {
    const client = await pool.connect();
    try {
      const now = new Date();
      const result = await client.query(
        `INSERT INTO orders 
         (owner_id, user_id, pickup_id, items, product_ids, order_status, order_date, total, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
         RETURNING id`,
        [
          orderData.ownerId,
          orderData.userId,
          orderData.pickupId,
          JSON.stringify(orderData.items),
          orderData.productIds,
          // 必要に応じて上記を以下に変換
          // orderData.productIds.map(id => String(id))
          orderData.orderStatus,
          orderData.orderDate,
          orderData.total,
          now,
          now,
        ]
      );

      return result.rows[0].id;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("注文の作成に失敗しました:", error);
    throw new Error("注文の作成に失敗しました");
  }
};

// =====取得メソッド=====

/**
 * オーナーの全注文を取得する
 */
export const fetchOrders = async (ownerId: string): Promise<Order[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id, user_id, pickup_id, items, product_ids, 
         order_status, order_date, total, created_at, updated_at 
         FROM orders 
         WHERE owner_id = $1`,
        [ownerId]
      );

      return result.rows.map(toOrder);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("注文の取得に失敗しました:", error);
    throw new Error("注文の取得に失敗しました");
  }
};

/**
 * 注文IDで取得
 */
export const fetchOrderById = async (
  ownerId: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id, user_id, pickup_id, items, product_ids, 
         order_status, order_date, total, created_at, updated_at 
         FROM orders 
         WHERE owner_id = $1 AND id = $2`,
        [ownerId, orderId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return toOrder(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`注文ID: ${orderId} の取得に失敗しました:`, error);
    throw new Error("注文の取得に失敗しました");
  }
};

/**
 * 新規注文を取得する関数
 */
//TODO OrderStatus.NEW_ORDERは、エラーが出るなら"newOrder"としても良い
export const fetchNewOrders = async (ownerId: string): Promise<Order[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id, user_id, pickup_id, items, product_ids, 
         order_status, order_date, total, created_at, updated_at 
         FROM orders 
         WHERE owner_id = $1 AND order_status = $2
         ORDER BY order_date ASC`,
        [ownerId, OrderStatus.NEW_ORDER]
      );

      return result.rows.map(toOrder);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("新規注文の取得に失敗しました:", error);
    throw new Error("新規注文の取得に失敗しました");
  }
};

/**
 * 過去注文（新規注文以外）を取得する関数
 */
export const fetchPastOrders = async (ownerId: string): Promise<Order[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id, user_id, pickup_id, items, product_ids, 
         order_status, order_date, total, created_at, updated_at 
         FROM orders 
         WHERE owner_id = $1 AND order_status != $2
         ORDER BY order_date DESC`,
        [ownerId, OrderStatus.NEW_ORDER]
      );

      return result.rows.map(toOrder);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("過去注文の取得に失敗しました:", error);
    throw new Error("過去注文の取得に失敗しました");
  }
};

/**
 * ユーザーの注文を取得する関数
 */
export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, owner_id, user_id, pickup_id, items, product_ids, 
         order_status, order_date, total, created_at, updated_at 
         FROM orders 
         WHERE user_id = $1
         ORDER BY order_date DESC`,
        [userId]
      );

      return result.rows.map(toOrder);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("ユーザー注文の取得に失敗しました:", error);
    throw new Error("ユーザー注文の取得に失敗しました");
  }
};

// =====更新メソッド=====

/**
 * 注文ステータスを更新する
 */
export const updateOrderStatus = async (
  ownerId: string,
  orderId: string,
  newStatus: OrderStatus
): Promise<void> => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE orders 
         SET order_status = $1, updated_at = NOW() 
         WHERE owner_id = $2 AND id = $3`,
        [newStatus, ownerId, orderId]
      );

      if (result.rowCount === 0) {
        throw new Error("注文が見つからないか、更新する権限がありません");
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      `注文ID: ${orderId} の注文ステータスの更新に失敗しました:`,
      error
    );
    throw new Error("注文ステータスの更新に失敗しました");
  }
};
