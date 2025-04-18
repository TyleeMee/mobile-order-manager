/// Timestamp型のフィールドを検出してDate型に変換
export function formatFirestoreData<T extends Record<string, unknown>>(
  data: Record<string, unknown>
): T {
  const formatted = { ...data };

  // Timestamp型のフィールドを検出して変換
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Timestamp) {
      formatted[key] = value.toDate();
    }
  });

  return formatted as T;
}

import { DocumentData, Timestamp } from "firebase/firestore";

import { Category } from "@/app/(app-content)/(dashboard)/categories/(domain)/category";
import {
  Order,
  orderStatusFromString,
} from "@/app/(app-content)/(dashboard)/orders/(domain)/order";
import {
  Product,
  ProductID,
} from "@/app/(app-content)/(dashboard)/products/(domain)/product";
import { Shop } from "@/app/(app-content)/(dashboard)/shop/(domain)/shop";

// タイムスタンプライクなオブジェクトの型定義
interface TimestampLike {
  _seconds: number;
  _nanoseconds?: number;
}

/**
 * 値がTimestampLikeかどうかを判定する型ガード
 */
function isTimestampLike(value: unknown): value is TimestampLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof (value as Record<string, unknown>)._seconds === "number"
  );
}

/**
 * TimestampまたはNumber型またはシリアライズされたTimestampをDateに変換する
 * _nanosecondsも考慮した完全対応版
 */
export function convertTimestamp(
  timestamp:
    | Timestamp
    | number
    | { _seconds: number; _nanoseconds: number }
    | unknown
): Date {
  if (!timestamp) {
    return new Date();
  }

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  } else if (typeof timestamp === "number") {
    return new Date(timestamp);
  } else if (isTimestampLike(timestamp)) {
    // 型ガードにより、timestampは TimestampLike として安全に扱える
    const seconds = timestamp._seconds || 0;

    // _nanoseconds がある場合は秒の小数部分として追加
    const nanos = timestamp._nanoseconds || 0;

    // ナノ秒をミリ秒に変換して追加 (1ナノ秒 = 0.000001ミリ秒)
    return new Date(seconds * 1000 + nanos / 1000000);
  }

  return new Date();
}

/**
 * Firestoreから取得したドキュメントをCategoryオブジェクトに変換
 */
export function toCategory(docId: string, docData: DocumentData): Category {
  return {
    id: docId,
    title: docData.title || "",
    created: convertTimestamp(docData.created),
    updated: convertTimestamp(docData.updated),
  };
}

/**
 * Firestoreから取得したドキュメントをProductオブジェクトに変換
 */
export function toProduct(docId: string, docData: DocumentData): Product {
  return {
    id: docId,
    categoryId: docData.categoryId || "",
    title: docData.title || "",
    imageUrl: docData.imageUrl || "",
    imagePath: docData.imagePath || "",
    description: docData.description || undefined,
    price: Number(docData.price) || 0,
    isVisible: Boolean(docData.isVisible),
    isOrderAccepting: Boolean(docData.isOrderAccepting),
    created: convertTimestamp(docData.created),
    updated: convertTimestamp(docData.updated),
  };
}

/**
 * Firestoreから取得したドキュメントをShopオブジェクトに変換
 */
export function toShop(docId: string, docData: DocumentData): Shop {
  return {
    id: docId,
    title: docData.title || "",
    imageUrl: docData.imageUrl || "",
    imagePath: docData.imagePath || "",
    description: docData.description || undefined,
    prefecture: docData.prefecture || "東京都",
    city: docData.city || "",
    streetAddress: docData.streetAddress || "",
    building: docData.building || undefined,
    isVisible: Boolean(docData.isVisible),
    isOrderAccepting: Boolean(docData.isOrderAccepting),
    created: convertTimestamp(docData.created),
    updated: convertTimestamp(docData.updated),
  };
}

/**
 * dynamic値からRecordまたはMapを変換する
 */
export function toItemsMap(
  value: unknown,
  defaultValue: Record<ProductID, number> = {}
): Record<ProductID, number> {
  if (!value) return defaultValue;

  if (typeof value === "object" && value !== null) {
    const result: Record<string, number> = {};

    Object.entries(value).forEach(([key, val]) => {
      if (typeof val === "number") {
        result[key] = val;
      } else if (val !== null && !isNaN(Number(val))) {
        // 数値に変換できる場合
        result[key] = Number(val);
      }
    });

    return result;
  }

  return defaultValue;
}

/**
 * dynamic値からProductIDの配列に変換する
 */
export function toProductIdsList(
  value: unknown,
  defaultValue: ProductID[] = []
): ProductID[] {
  if (!value) return defaultValue;

  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return defaultValue;
}

/**
 * Firestoreデータから Order オブジェクトに変換する
 */
export function toOrder(docId: string, docData: DocumentData): Order {
  return {
    id: docId,
    pickupId: docData.pickupId || "",
    items: toItemsMap(docData.items),
    productIds: toProductIdsList(docData.productIds),
    orderStatus: orderStatusFromString(docData.orderStatus),
    orderDate: convertTimestamp(docData.orderDate),
    total: Number(docData.total) || 0.0,
  };
}
