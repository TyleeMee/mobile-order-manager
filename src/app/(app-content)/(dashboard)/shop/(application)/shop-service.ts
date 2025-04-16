"use server";

import { shopSchema } from "@/validation/shop-schema";

import { addShop, fetchShop, updateShop } from "../(data)/shop-repository";
import { ShopData, ShopResult } from "../(domain)/shop";

// =====作成メソッド=====

export const createShop = async (
  uid: string,
  shopData: ShopData
): Promise<ShopResult> => {
  //バリデーションチェック
  const validation = shopSchema.safeParse(shopData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    //データ層を呼び出してShopを作成
    await addShop(uid, shopData);
    return {};
  } catch (error) {
    console.error("店舗の作成に失敗しました:", error);
    return {
      error: true,
      message: "店舗の作成に失敗しました",
    };
  }
};

// =====取得メソッド=====

// 特定の商品をIDで取得
export const getShop = async (uid: string) => {
  try {
    // データリポジトリから商品を取得
    const shop = await fetchShop(uid);
    return shop;
  } catch (error) {
    console.error(`店舗の取得に失敗しました:`, error);
    return null;
  }
};

// =====更新メソッド=====

export const editShop = async (
  uid: string,
  shopData: Partial<ShopData>
): Promise<ShopResult> => {
  // バリデーションチェック（部分更新の場合はpartialなスキーマを使用する必要があるかもしれません）
  const validation = shopSchema.partial().safeParse(shopData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    // データ層を呼び出してShopを更新
    await updateShop(uid, shopData);

    return {};
  } catch (error) {
    console.error(`店舗の更新に失敗しました:`, error);
    return {
      error: true,
      message: "店舗の更新に失敗しました",
    };
  }
};
