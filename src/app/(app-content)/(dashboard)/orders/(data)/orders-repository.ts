import { toOrder } from "@/lib/firebase/firestore-converters";

import { firestore } from "../../../../../../firebase/server";
import { Order } from "../(domain)/order";

// =====ヘルパー関数=====

//オーナードキュメント参照を取得する
const getOwnerRef = (ownerId: string) => {
  return firestore.collection("owners").doc(ownerId);
};

// 商品コレクション参照を取得する
const getOrdersRef = (ownerId: string) => {
  return getOwnerRef(ownerId).collection("orders");
};

//商品ドキュメント参照を取得する
const getOrderRef = (ownerId: string, orderId: string) => {
  return getOrdersRef(ownerId).doc(orderId);
};

//=====取得メソッド=====

//全注文を取得する
export const fetchOrders = async (uid: string): Promise<Order[]> => {
  try {
    const ordersRef = getOrdersRef(uid);
    const snapshot = await ordersRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => toOrder(doc.id, doc.data()));
  } catch (error) {
    console.error("オーダの取得に失敗しました:", error);
    throw new Error("オーダの取得に失敗しました");
  }
};

// 新規オーダーを取得する関数
export const fetchNewOrders = async (uid: string): Promise<Order[]> => {
  try {
    const ordersRef = getOrdersRef(uid);
    const snapshot = await ordersRef
      .where("orderStatus", "==", "newOrder")
      //* 複合クエリにするとエラーが発生するので、orderByは使わない
      //   .orderBy("orderDate", "asc") // orderDateで昇順（古い順）に並び替え
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => toOrder(doc.id, doc.data()));
  } catch (error) {
    console.error("新規オーダーの取得に失敗しました:", error);
    throw new Error("新規オーダーの取得に失敗しました");
  }
};

// 過去オーダー（新規オーダー以外）を取得する関数
export const fetchPastOrders = async (uid: string): Promise<Order[]> => {
  try {
    const ordersRef = getOrdersRef(uid);
    const snapshot = await ordersRef
      .where("orderStatus", "!=", "newOrder")
      //* 複合クエリにするとエラーが発生するので、orderByは使わない
      //   .orderBy("orderDate", "desc") // 日付降順（新しい順）
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => toOrder(doc.id, doc.data()));
  } catch (error) {
    console.error("過去オーダーの取得に失敗しました:", error);
    throw new Error("過去オーダーの取得に失敗しました");
  }
};

// 注文IDで取得
export const fetchOrderById = async (
  uid: string,
  orderId: string
): Promise<Order | null> => {
  try {
    const orderRef = getOrderRef(uid, orderId);
    const docSnapshot = await orderRef.get();

    if (!docSnapshot.exists) {
      return null;
    }
    return toOrder(docSnapshot.id, docSnapshot.data() || {});
  } catch (error) {
    console.error(`注文ID: ${orderId} の取得に失敗しました:`, error);
    throw new Error("注文の取得に失敗しました");
  }
};

//=====更新メソッド=====

//注文ステータスを更新する
export const updateOrderStatus = async (
  uid: string,
  orderId: string,
  newStatus: string
): Promise<void> => {
  try {
    // 注文ドキュメントへのパスを構築
    const orderRef = getOrderRef(uid, orderId);

    // 注文ステータスを更新
    //TODO newStatusをstringに変換する必要がないか確認
    await orderRef.update({
      orderStatus: newStatus,
    });
  } catch (error) {
    console.error(
      `注文ID: ${orderId} の注文ステータスの更新に失敗しました:`,
      error
    );
    throw new Error(`注文ステータスの更新に失敗しました:`);
  }
};
