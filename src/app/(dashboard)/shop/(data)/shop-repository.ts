"use server";

import { toShop } from "@/lib/firebase/firestore-converters";

import { firestore } from "../../../../../firebase/server";
import { Shop, ShopData } from "../(domain)/shop";

// ドキュメントID（単一の店舗情報を表す固定値）
const SHOP_DOC_ID = "shop";

// =====作成メソッド=====
export const addShop = async (
  uid: string,
  shopData: ShopData
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const shopRef = userRef.collection("shop").doc(SHOP_DOC_ID);

    //TODO このブロックいらないかも
    // 既存データの確認（すでに存在する場合はエラー）
    const docSnapshot = await shopRef.get();
    if (docSnapshot.exists) {
      throw new Error(
        "店舗情報はすでに存在します。更新するには updateShop を使用してください。"
      );
    }

    await shopRef.set({
      ...shopData,
      created: new Date(),
      updated: new Date(),
    });
  } catch (error) {
    console.error("店舗情報の作成に失敗しました:", error);
    throw new Error("店舗情報の作成に失敗しました");
  }
};

//=====取得メソッド=====

export const fetchShop = async (uid: string): Promise<Shop | null> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const shopRef = userRef.collection("shop").doc(SHOP_DOC_ID);

    const docSnapshot = await shopRef.get();

    if (!docSnapshot.exists) {
      return null;
    }

    return toShop(docSnapshot.id, docSnapshot.data() || {});
  } catch (error) {
    console.error("店舗情報の取得に失敗しました:", error);
    throw new Error("店舗情報の取得に失敗しました");
  }
};

//=====更新メソッド=====

export const updateShop = async (
  uid: string,
  shopData: Partial<ShopData>
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const shopRef = userRef.collection("shop").doc(SHOP_DOC_ID);

    // ドキュメントの存在確認
    const docSnapshot = await shopRef.get();
    if (!docSnapshot.exists) {
      throw new Error("店舗情報が見つかりません");
    }

    // 更新日時を追加して更新
    await shopRef.update({
      ...shopData,
      updated: new Date(),
    });
  } catch (error) {
    console.error(`店舗情報の更新に失敗しました:`, error);
    throw new Error("店舗情報の更新に失敗しました");
  }
};
