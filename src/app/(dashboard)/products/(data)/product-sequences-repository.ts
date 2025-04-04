"use server";

import { FieldValue } from "firebase-admin/firestore";

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

// 商品の順序管理
// 新しい商品を追加（末尾に追加）
export const addIdToProductSequence = async (
  uid: string,
  categoryId: string,
  productId: string
) => {
  const userRef = firestore.collection("owners").doc(uid);
  const docRef = userRef
    .collection("sortSequences")
    .doc("productSequencesByCategoryId");
  const docSnap = await docRef.get();

  const data = docSnap.exists ? docSnap.data() || {} : {};

  // カテゴリーの商品配列を取得または初期化
  const productIds: string[] = data[categoryId] || [];
  productIds.push(productId);

  // 更新されたデータを保存
  data[categoryId] = productIds;

  // ドキュメントが存在しない場合は新規作成
  await docRef.set(data);
};

// =====取得メソッド=====

// カテゴリ内の商品順序を取得
export const fetchProductSequence = async (uid: string, categoryId: string) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const sequenceDoc = await userRef
      .collection("sortSequences")
      .doc("productSequencesByCategoryId")
      .get();

    if (!sequenceDoc.exists) {
      return null; // 順序情報がまだ存在しない場合
    }

    const data = sequenceDoc.data();
    return (data?.[categoryId] as string[]) || null;
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品順序取得に失敗しました:`,
      error
    );
    return null;
  }
};

// =====更新メソッド=====

// カテゴリー内の商品順序を更新
export const updateProductSequence = async (
  uid: string,
  productIds: string[],
  categoryId: string
) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const docRef = userRef
      .collection("sortSequences")
      .doc("productSequencesByCategoryId");

    // トランザクションを使用して順序を更新
    // 競合を防ぎ、データの整合性を確保
    await firestore.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);

      // 既存のデータを取得またはオブジェクトを初期化
      const data = docSnap.exists ? docSnap.data() || {} : {};

      // 新しい順序で更新
      data[categoryId] = productIds;

      // トランザクション内でドキュメントを更新
      transaction.set(docRef, data);
    });

    console.log(`カテゴリID: ${categoryId} の商品順序を更新しました`);
    return true;
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品順序更新に失敗しました:`,
      error
    );
    throw error; // エラーを呼び出し元に伝播させる
  }
};

// =====削除メソッド=====

//カテゴリーから商品IDを削除
export const deleteIdFromProductSequence = async (
  uid: string,
  categoryId: string,
  productId: string
) => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const docRef = userRef
      .collection("sortSequences")
      .doc("productSequencesByCategoryId");

    // ドキュメントを取得
    const docSnap = await docRef.get();

    // ドキュメントが存在しない場合はエラー
    if (!docSnap.exists) {
      throw new Error(`商品順序情報が見つかりません（ユーザーID: ${uid}）`);
    }

    // 既存のデータを取得
    const data = docSnap.data() || {};

    // カテゴリーの商品配列を取得
    const productIds: string[] = data[categoryId] || [];

    // 商品IDの配列から削除する商品を除外
    const updatedProductIds = productIds.filter((id) => id !== productId);

    // カテゴリーの商品数が変わらない場合（削除対象が見つからなかった場合）
    if (productIds.length === updatedProductIds.length) {
      console.warn(
        `カテゴリーID: ${categoryId} に商品ID: ${productId} が見つかりませんでした`
      );
    }

    // 更新するフィールドのみを指定して更新
    await docRef.update({
      [categoryId]: updatedProductIds,
    });

    console.log(
      `カテゴリーID: ${categoryId} から商品ID: ${productId} を削除しました`
    );
    return true;
  } catch (error) {
    console.error(
      `カテゴリーID: ${categoryId} から商品ID: ${productId} の削除に失敗しました:`,
      error
    );
    throw error; // エラーを呼び出し元に伝播させる
  }
};

// カテゴリに関連する全商品順序情報を削除
export const deleteProductSequence = async (
  uid: string,
  categoryId: string
): Promise<void> => {
  try {
    const userRef = firestore.collection("owners").doc(uid);
    const docRef = userRef
      .collection("sortSequences")
      .doc("productSequencesByCategoryId");

    // ドキュメントを取得
    const docSnap = await docRef.get();

    // ドキュメントが存在しない場合は何もしない
    if (!docSnap.exists) {
      console.log(`商品順序情報が見つかりません（ユーザーID: ${uid}）`);
      return;
    }

    // 既存のデータを取得
    const data = docSnap.data() || {};

    // カテゴリIDのフィールドが存在する場合は削除
    if (categoryId in data) {
      // フィールドを削除
      await docRef.update({
        [categoryId]: FieldValue.delete(),
      });

      console.log(`カテゴリーID: ${categoryId} の商品順序情報を削除しました`);
    } else {
      console.log(
        `カテゴリーID: ${categoryId} の商品順序情報が見つかりませんでした`
      );
    }
  } catch (error) {
    console.error(
      `カテゴリーID: ${categoryId} の商品順序情報の削除に失敗しました:`,
      error
    );
    throw error; // エラーを呼び出し元に伝播させる
  }
};
