"use server";

import { firestore } from "../../../../../firebase/server";

//=====データ構造=====

// sortSequences（コレクション）
//   - categorySequence（ドキュメント）
//     - ids: string[]  // カテゴリーIDの配列（順序付き）

//   - productSequencesByCategoryId（ドキュメント）
//     - categoryId_1: string[]  // カテゴリー1内のproductIDの配列（順序付き）
//     - categoryId_2: string[]  // カテゴリー2内のproductIDの配列（順序付き）
//     - ...他のカテゴリー

// =====作成メソッド=====

// カテゴリーの順序管理
// 新しいカテゴリーを追加（末尾に追加）
export const addCategorySequence = async (uid: string, categoryId: string) => {
  const userRef = firestore.collection("owners").doc(uid);
  const docRef = userRef.collection("sortSequences").doc("categorySequence");
  const docSnap = await docRef.get();

  if (docSnap.exists) {
    //  末尾にcategoryIdを追加して更新
    await docRef.update({
      ids: [...(docSnap.data()?.ids || []), categoryId],
    });
  } else {
    // ドキュメントが存在しない場合は新規作成
    await docRef.set({
      ids: [categoryId],
    });
  }
};

// =====取得メソッド=====

// カテゴリの順序情報を取得
export const fetchCategorySequence = async (uid: string) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const orderDoc = await userRef
      .collection("sortSequences")
      .doc("categorySequence")
      .get();

    if (!orderDoc.exists) {
      //TODO 必要であれば return string[];に
      return null; // 順序情報がまだ存在しない場合
    }

    return orderDoc.data()?.ids as string[];
  } catch (error) {
    console.error("カテゴリ順序の取得に失敗しました:", error);
    return null;
  }
};

// =====更新メソッド=====

// カテゴリー順序を更新
export const updateCategorySequence = async (
  uid: string,
  categoryIds: string[]
) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const docRef = userRef.collection("sortSequences").doc("categorySequence");

    // トランザクションを使用して順序を更新
    // 競合を防ぎ、データの整合性を確保
    await firestore.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);

      // 既存のデータを取得またはオブジェクトを初期化
      const data = docSnap.exists ? docSnap.data() || {} : {};

      // 新しい順序で更新
      data.ids = categoryIds;

      // トランザクション内でドキュメントを更新
      transaction.set(docRef, data);
    });

    console.log("商品カテゴリー順序を更新しました");
    return true;
  } catch (error) {
    console.error("カテゴリー順序更新に失敗しました:", error);
    throw error;
  }
};

// =====削除メソッド=====

//配列からカテゴリーIDを削除
export const deleteCategorySequence = async (
  uid: string,
  categoryId: string
) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const docRef = userRef.collection("sortSequences").doc("categorySequence");

    // ドキュメントを取得
    const docSnap = await docRef.get();

    // ドキュメントが存在しない場合はエラー
    if (!docSnap.exists) {
      throw new Error(
        `カテゴリー順序情報が見つかりません（ユーザーID: ${uid}）`
      );
    }

    // 既存のデータを取得
    const data = docSnap.data() || {};

    // カテゴリーIDの配列を取得
    const categoryIds: string[] = data.ids || [];

    // カテゴリーIDの配列から削除するカテゴリーを除外
    const updatedCategoryIds = categoryIds.filter((id) => id !== categoryId);

    // カテゴリー数が変わらない場合（削除対象が見つからなかった場合）
    if (categoryIds.length === updatedCategoryIds.length) {
      console.warn(
        `categorySequenceからカテゴリーID: ${categoryId} が見つかりませんでした`
      );
    }

    // 更新するフィールドのみを指定して更新
    await docRef.update({
      ids: updatedCategoryIds,
    });

    console.log(
      `categorySequenceからカテゴリーID: ${categoryId} を削除しました`
    );
    return true;
  } catch (error) {
    console.error(
      `categorySequenceからカテゴリーID: ${categoryId} の削除に失敗しました:`,
      error
    );
    throw error; // エラーを呼び出し元に伝播させる
  }
};
