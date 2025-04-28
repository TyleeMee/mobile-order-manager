"use server";

import { fetchProductTitleById } from "../../products-firebase/(data)/products-repository";
import {
  fetchNewOrders,
  fetchOrderById,
  fetchOrders,
  fetchPastOrders,
  updateOrderStatus,
} from "../(data)/orders-repository";
import { Order } from "../(domain)/order";

// 注文に製品タイトル情報を追加した拡張型
export type OrderWithProductTitles = Order & {
  productTitles: Record<string, string>;
};

// 全注文を取得し、製品タイトル情報を付加する
export async function getOrders(
  uid: string
): Promise<OrderWithProductTitles[]> {
  try {
    // 基本の注文データを取得
    const orders = await fetchOrders(uid);

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(uid, orders);
  } catch (error) {
    console.error("オーダーの取得に失敗しました:", error);
    throw new Error("オーダーの取得に失敗しました");
  }
}

// 新規オーダーを取得し、製品タイトル情報を付加する
export async function getNewOrders(
  uid: string
): Promise<OrderWithProductTitles[]> {
  try {
    // 新規オーダーを取得
    const orders = await fetchNewOrders(uid);

    // 日付で昇順にソート（古い順）
    orders.sort((a, b) => {
      return a.orderDate.getTime() - b.orderDate.getTime();
    });

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(uid, orders);
  } catch (error) {
    console.error("新規オーダーの取得に失敗しました:", error);
    throw new Error("新規オーダーの取得に失敗しました");
  }
}

// 過去オーダーを取得し、製品タイトル情報を付加する
export async function getPastOrders(
  uid: string
): Promise<OrderWithProductTitles[]> {
  try {
    // 過去オーダーを取得
    const orders = await fetchPastOrders(uid);

    // 日付で降順にソート（新しい順）
    orders.sort((a, b) => {
      return b.orderDate.getTime() - a.orderDate.getTime();
    });

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(uid, orders);
  } catch (error) {
    console.error("過去オーダーの取得に失敗しました:", error);
    throw new Error("過去オーダーの取得に失敗しました");
  }
}

// 注文IDで取得し、製品タイトル情報を付加する
export async function getOrderById(
  uid: string,
  orderId: string
): Promise<OrderWithProductTitles | null> {
  try {
    // 注文を取得
    const order = await fetchOrderById(uid, orderId);

    if (!order) {
      return null;
    }

    // 製品タイトル情報を付加
    const ordersWithTitles = await enrichOrdersWithProductTitles(uid, [order]);
    return ordersWithTitles[0];
  } catch (error) {
    console.error(`注文ID: ${orderId} の取得に失敗しました:`, error);
    throw new Error("注文の取得に失敗しました");
  }
}

// 注文ステータスを更新する
export async function changeOrderStatus(
  uid: string,
  orderId: string,
  newStatus: string
): Promise<void> {
  try {
    await updateOrderStatus(uid, orderId, newStatus);
  } catch (error) {
    console.error(`注文ステータスの更新に失敗しました:`, error);
    throw new Error("注文ステータスの更新に失敗しました");
  }
}

// 注文データに製品タイトル情報を付加するヘルパー関数
async function enrichOrdersWithProductTitles(
  uid: string,
  orders: Order[]
): Promise<OrderWithProductTitles[]> {
  // すべての注文から一意の製品IDを抽出
  const uniqueProductIds = new Set<string>();
  orders.forEach((order) => {
    Object.keys(order.items).forEach((productId) => {
      uniqueProductIds.add(productId);
    });
  });

  // 製品IDごとにタイトルを取得し、マップを作成
  const productTitleMap: Record<string, string> = {};

  // 全製品IDに対するタイトル取得を並列実行
  await Promise.all(
    Array.from(uniqueProductIds).map(async (productId) => {
      try {
        const title = await fetchProductTitleById(uid, productId);
        productTitleMap[productId] = title || productId; // タイトルが取得できなければIDを使用
      } catch (err) {
        console.error(`製品タイトル取得エラー (${productId}):`, err);
        productTitleMap[productId] = productId; // エラー時はIDをそのまま表示
      }
    })
  );

  // 各注文に製品タイトル情報を付加
  return orders.map((order) => {
    const productTitles: Record<string, string> = {};

    Object.keys(order.items).forEach((productId) => {
      productTitles[productId] = productTitleMap[productId] || productId;
    });

    return {
      ...order,
      productTitles,
    };
  });
}
