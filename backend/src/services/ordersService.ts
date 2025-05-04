import {
  fetchOrderById,
  fetchOrders,
  fetchNewOrders,
  fetchPastOrders,
  updateOrderStatus,
  createOrder,
} from "../repositories/ordersRepository";
import { fetchProductById } from "../repositories/productsRepository";
import {
  Order,
  OrderData,
  OrderWithProductTitles,
  OrderStatus,
  OrderResult,
} from "../models/Order";
import {
  formatZodError,
  orderSchema,
  orderStatusUpdateSchema,
} from "../validation/orderSchema";

/**
 * 注文を作成する
 */
export const createNewOrder = async (
  orderData: Partial<OrderData>
): Promise<OrderResult> => {
  try {
    // バリデーション
    const validation = orderSchema.safeParse(orderData);
    if (!validation.success) {
      return formatZodError(validation.error);
    }

    // 注文を作成
    const orderId = await createOrder(orderData as OrderData);

    return { id: orderId };
  } catch (error) {
    console.error("注文作成エラー:", error);
    return {
      error: true,
      message:
        error instanceof Error ? error.message : "注文の作成に失敗しました",
    };
  }
};

/**
 * 全注文を取得し、製品タイトル情報を付加する
 */
export const getOrders = async (
  ownerId: string
): Promise<OrderWithProductTitles[]> => {
  try {
    // 基本の注文データを取得
    const orders = await fetchOrders(ownerId);

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(ownerId, orders);
  } catch (error) {
    console.error("オーダーの取得に失敗しました:", error);
    throw new Error("オーダーの取得に失敗しました");
  }
};

/**
 * 新規オーダーを取得し、製品タイトル情報を付加する
 */
export const getNewOrders = async (
  ownerId: string
): Promise<OrderWithProductTitles[]> => {
  try {
    // 新規オーダーを取得（リポジトリ層でソート済み）
    const orders = await fetchNewOrders(ownerId);

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(ownerId, orders);
  } catch (error) {
    console.error("新規オーダーの取得に失敗しました:", error);
    throw new Error("新規オーダーの取得に失敗しました");
  }
};

/**
 * 過去オーダーを取得し、製品タイトル情報を付加する
 */
export const getPastOrders = async (
  ownerId: string
): Promise<OrderWithProductTitles[]> => {
  try {
    // 過去オーダーを取得（リポジトリ層でソート済み）
    const orders = await fetchPastOrders(ownerId);

    // 製品タイトル情報を付加
    return await enrichOrdersWithProductTitles(ownerId, orders);
  } catch (error) {
    console.error("過去オーダーの取得に失敗しました:", error);
    throw new Error("過去オーダーの取得に失敗しました");
  }
};

/**
 * 注文IDで取得し、製品タイトル情報を付加する
 */
export const getOrderById = async (
  ownerId: string,
  orderId: string
): Promise<OrderWithProductTitles | null> => {
  try {
    // 注文を取得
    const order = await fetchOrderById(ownerId, orderId);

    if (!order) {
      return null;
    }

    // 製品タイトル情報を付加
    const ordersWithTitles = await enrichOrdersWithProductTitles(ownerId, [
      order,
    ]);
    return ordersWithTitles[0];
  } catch (error) {
    console.error(`注文ID: ${orderId} の取得に失敗しました:`, error);
    throw new Error("注文の取得に失敗しました");
  }
};

/**
 * 注文ステータスを更新する
 */
export const changeOrderStatus = async (
  ownerId: string,
  orderId: string,
  newStatus: string
): Promise<OrderResult> => {
  try {
    // バリデーション
    const validation = orderStatusUpdateSchema.safeParse({
      orderStatus: newStatus,
    });
    if (!validation.success) {
      return formatZodError(validation.error);
    }

    await updateOrderStatus(ownerId, orderId, newStatus as OrderStatus);
    return { id: orderId };
  } catch (error) {
    console.error(`注文ステータスの更新に失敗しました:`, error);
    return {
      error: true,
      message:
        error instanceof Error
          ? error.message
          : "注文ステータスの更新に失敗しました",
    };
  }
};

/**
 * 注文データに製品タイトル情報を付加するヘルパー関数
 */
async function enrichOrdersWithProductTitles(
  ownerId: string,
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
        const product = await fetchProductById(ownerId, productId);
        productTitleMap[productId] = product ? product.title : productId; // 製品が取得できなければIDを使用
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
