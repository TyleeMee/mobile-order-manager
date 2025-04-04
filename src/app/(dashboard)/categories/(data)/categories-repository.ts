"use server";

import { formatFirestoreData } from "@/lib/firebase/utils";

import { firestore } from "../../../../../firebase/server";
import { Category, CategoryData } from "../(domain)/category";

// =====作成メソッド=====
export const addCategory = async (
  uid: string,
  categoryData: CategoryData
): Promise<string> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const categoryRef = userRef.collection("categories");

    const category = await categoryRef.add({
      ...categoryData,
      created: new Date(),
      updated: new Date(),
    });

    return category.id;
  } catch (error) {
    console.error("カテゴリの追加に失敗しました:", error);
    return ""; // エラー時は空文字を返す（呼び出し元で判定しやすくする）
  }
};

//=====取得メソッド=====
export const fetchCategories = async (uid: string) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const categoryRef = userRef.collection("categories");

    const snapshot = await categoryRef.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) =>
      formatFirestoreData<Category>({
        id: doc.id,
        ...doc.data(),
      })
    );
  } catch (error) {
    console.error("カテゴリの取得に失敗しました:", error);
    throw new Error("カテゴリの取得に失敗しました");
  }
};

export const fetchCategoryById = async (uid: string, categoryId: string) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const categoryDoc = await userRef
      .collection("categories")
      .doc(categoryId)
      .get();

    if (!categoryDoc.exists) {
      throw new Error("指定されたカテゴリが見つかりません");
    }

    return formatFirestoreData<Category>({
      id: categoryDoc.id,
      ...categoryDoc.data(),
    });
  } catch (error) {
    console.error(`カテゴリID: ${categoryId} の取得に失敗しました:`, error);
    throw new Error("カテゴリの取得に失敗しました");
  }
};

// =====更新メソッド=====

export const updateCategory = async (
  uid: string,
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const categoryRef = userRef.collection("categories").doc(categoryId);

    // ドキュメントの存在確認
    const docSnapshot = await categoryRef.get();
    if (!docSnapshot.exists) {
      throw new Error("指定された商品カテゴリーが見つかりません");
    }

    // 更新日時を追加して更新
    await categoryRef.update({
      ...categoryData,
      updated: new Date(),
    });
  } catch (error) {
    console.error(`カテゴリーID: ${categoryId} の更新に失敗しました:`, error);
    throw new Error("カテゴリーの更新に失敗しました");
  }
};

//=====削除メソッド=====

export const deleteCategory = async (
  uid: string,
  categoryId: string
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const categoryRef = userRef.collection("categories").doc(categoryId);

    // ドキュメントの存在確認
    const docSnapshot = await categoryRef.get();
    if (!docSnapshot.exists) {
      throw new Error("指定された商品カテゴリーが見つかりません");
    }

    // 商品カテゴリーを削除
    await categoryRef.delete();
  } catch (error) {
    console.error(`カテゴリーID: ${categoryId} の削除に失敗しました:`, error);
    throw new Error("カテゴリーの削除に失敗しました");
  }
};
