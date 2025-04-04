"use server";

import { formatFirestoreData } from "@/lib/firebase/utils";

import { firestore } from "../../../../../firebase/server";
import { Product, ProductData } from "../(domain)/product";

// =====作成メソッド=====
export const addProduct = async (
  uid: string,
  categoryId: string,
  productData: ProductData
): Promise<string> => {
  const userRef = firestore.collection("owners").doc(uid);
  const productRef = userRef.collection("products");

  const product = await productRef.add({
    ...productData,
    categoryId: categoryId,
    created: new Date(),
    updated: new Date(),
  });

  return product.id;
};

//=====取得メソッド=====

// 全商品取得
export const fetchProducts = async (uid: string) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const productsRef = userRef.collection("products");

    const snapshot = await productsRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) =>
      formatFirestoreData<Product>({
        id: doc.id,
        ...doc.data(),
      })
    );
  } catch (error) {
    console.error("商品の取得に失敗しました:", error);
    throw new Error("商品の取得に失敗しました");
  }
};

// カテゴリ内の商品取得
export const fetchProductsInCategory = async (
  uid: string,
  categoryId: string
) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const productsRef = userRef.collection("products");

    const snapshot = await productsRef
      .where("categoryId", "==", categoryId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) =>
      formatFirestoreData<Product>({
        id: doc.id,
        ...doc.data(),
      })
    );
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
    const userRef = firestore.collection("owners").doc(uid);
    const productRef = userRef.collection("products").doc(productId);

    const docSnapshot = await productRef.get();

    if (!docSnapshot.exists) {
      return null;
    }

    return formatFirestoreData<Product>({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    });
  } catch (error) {
    console.error(`商品ID: ${productId} の取得に失敗しました:`, error);
    throw new Error("商品の取得に失敗しました");
  }
};

//=====更新メソッド=====

export const updateProduct = async (
  uid: string,
  productId: string,
  productData: Partial<ProductData>
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const productRef = userRef.collection("products").doc(productId);

    // ドキュメントの存在確認
    const docSnapshot = await productRef.get();
    if (!docSnapshot.exists) {
      throw new Error("指定された商品が見つかりません");
    }

    // 更新日時を追加して更新
    await productRef.update({
      ...productData,
      updated: new Date(),
    });
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
    const userRef = firestore.collection("owners").doc(uid);
    const productRef = userRef.collection("products").doc(productId);

    // ドキュメントの存在確認
    const docSnapshot = await productRef.get();
    if (!docSnapshot.exists) {
      throw new Error("指定された商品が見つかりません");
    }

    // 商品をfirestoreから削除
    await productRef.delete();
  } catch (error) {
    console.error(`商品ID: ${productId} の削除に失敗しました:`, error);
    throw new Error("商品の削除に失敗しました");
  }
};
