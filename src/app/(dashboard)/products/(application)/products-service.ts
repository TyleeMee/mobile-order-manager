"use server";

import { productSchema } from "@/validation/product-schema";

import {
  addIdToProductSequence,
  deleteIdFromProductSequence,
  fetchProductSequence,
} from "../(data)/product-sequences-repository";
import {
  addProduct,
  deleteProduct,
  fetchProductById,
  fetchProductsInCategory,
  updateProduct,
} from "../(data)/products-repository";
import { Product, ProductData, ProductResult } from "../(domain)/product";

// =====作成メソッド=====

export const createProduct = async (
  uid: string,
  categoryId: string,
  productData: ProductData
): Promise<ProductResult> => {
  //バリデーションチェック
  const validation = productSchema.safeParse(productData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    //データ層を呼び出してProductを作成
    const productId = await addProduct(uid, categoryId, productData);

    // sortSequencesコレクションに新しいカテゴリーidを追加（末尾に追加）
    await addIdToProductSequence(uid, categoryId, productId);

    return {
      id: productId,
    };
  } catch (error) {
    console.error("商品の作成に失敗しました:", error);
    return {
      error: true,
      message: "商品の作成に失敗しました",
    };
  }
};

// =====取得メソッド=====

// 特定の商品をIDで取得
export const getProduct = async (uid: string, productId: string) => {
  try {
    // データリポジトリから商品を取得
    const product = await fetchProductById(uid, productId);
    return product;
  } catch (error) {
    console.error(`商品ID: ${productId} の取得に失敗しました:`, error);
    return null;
  }
};

// カテゴリ内の製品を並び順で取得
export const getSortedProductsInCategory = async (
  uid: string,
  categoryId: string
) => {
  try {
    // 製品データと順序情報を並行して取得
    const [products, sortedIds] = await Promise.all([
      fetchProductsInCategory(uid, categoryId),
      fetchProductSequence(uid, categoryId),
    ]);

    // 順序情報がない場合はデフォルトの順序（更新日時など）で製品を返す
    if (!sortedIds || sortedIds.length === 0) {
      return products.sort(
        (a, b) => (b.updated as Date).getTime() - (a.updated as Date).getTime()
      );
    }

    // 製品をマップに変換して検索を効率化
    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    // 指定された順序で製品を並び替え
    const sortedProducts = sortedIds
      .filter((id) => productMap.has(id)) // 存在する製品のみフィルタリング
      .map((id) => productMap.get(id)!);

    // 順序情報にない製品（新しく追加されたものなど）を末尾に追加
    const unsortedProducts = products.filter(
      (product) => !sortedIds.includes(product.id)
    );

    return [...sortedProducts, ...unsortedProducts];
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の並び順製品取得に失敗しました:`,
      error
    );
    return [];
  }
};

// =====更新メソッド=====

export const editProduct = async (
  uid: string,
  productId: string,
  productData: Partial<ProductData>
): Promise<ProductResult> => {
  // バリデーションチェック（部分更新の場合はpartialなスキーマを使用する必要があるかもしれません）
  const validation = productSchema.partial().safeParse(productData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    // データ層を呼び出してProductを更新
    await updateProduct(uid, productId, productData);

    return {
      id: productId,
    };
  } catch (error) {
    console.error(`商品ID ${productId}の更新に失敗しました:`, error);
    return {
      error: true,
      message: "商品の更新に失敗しました",
    };
  }
};

// =====削除メソッド=====
export const removeProduct = async (
  uid: string,
  categoryId: string,
  product: Product
): Promise<ProductResult> => {
  try {
    // 製品を削除
    await deleteProduct(uid, product.id);

    // 製品の並び順情報からも削除する
    await deleteIdFromProductSequence(uid, categoryId, product.id);

    //Firebase Storage から画像を削除
    // try {
    //   await storage.bucket().file(product.imagePath).delete();
    //   console.log(
    //     `商品ID ${product.id}の画像を削除しました: ${product.imagePath}`
    //   );
    // } catch (storageError) {
    //   // 画像削除に失敗しても商品削除は完了しているのでエラーログのみ
    //   console.error(
    //     `商品ID ${product.id}の画像削除に失敗しました:`,
    //     storageError
    //   );
    // }

    return {
      id: product.id,
    };
  } catch (error) {
    console.error(`商品ID ${product.id}の削除に失敗しました:`, error);
    return {
      error: true,
      message: "商品の削除に失敗しました",
    };
  }
};
