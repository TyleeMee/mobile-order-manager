"use server";

import { categorySchema } from "@/validation/category-schema";

import { removeProduct } from "../../products/(application)/products-service";
import { deleteProductSequence } from "../../products/(data)/product-sequences-repository";
import { fetchProductsInCategory } from "../../products/(data)/products-repository";
import {
  addCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoryById,
  updateCategory,
} from "../(data)/categories-repository";
import {
  addCategorySequence,
  deleteCategorySequence,
  fetchCategorySequence,
} from "../(data)/category-sequence-repository";
import { CategoryData, CategoryResult } from "../(domain)/category";

//=====作成系メソッド=====

export const createCategory = async (
  uid: string,
  categoryData: CategoryData
): Promise<CategoryResult> => {
  //バリデーションチェック
  const validation = categorySchema.safeParse(categoryData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    //データ層を呼び出してCategoryを作成
    const categoryId = await addCategory(uid, categoryData);

    // sortSequencesコレクションに新しいカテゴリーidを追加（末尾に追加）
    await addCategorySequence(uid, categoryId);

    return {
      id: categoryId,
    };
  } catch (error) {
    console.error("商品カテゴリーの作成に失敗しました:", error);
    return {
      error: true,
      message: "商品カテゴリーの作成に失敗しました",
    };
  }
};

//=====取得系メソッド=====

// カテゴリーをIDで取得
export const getCategory = async (uid: string, categoryId: string) => {
  try {
    // データリポジトリからカテゴリーを取得
    const category = await fetchCategoryById(uid, categoryId);
    return category;
  } catch (error) {
    console.error(
      `商品カテゴリーID: ${categoryId} の取得に失敗しました:`,
      error
    );
    return null;
  }
};

// カテゴリを順序情報に基づいて取得する関数
export const getSortedCategories = async (uid: string) => {
  try {
    // カテゴリデータと順序情報を並行して取得
    const [categories, categoryIds] = await Promise.all([
      fetchCategories(uid),
      fetchCategorySequence(uid),
    ]);

    // 順序情報がない場合はデフォルトの順序（作成日時など）でカテゴリを返す
    if (!categoryIds || categoryIds.length === 0) {
      return categories.sort(
        (a, b) => (b.updated as Date).getTime() - (a.updated as Date).getTime()
      );
    }

    // カテゴリをマップに変換して検索を効率化
    const categoryMap = new Map(
      categories.map((category) => [category.id, category])
    );

    // 指定された順序でカテゴリを並び替え
    const sortedCategories = categoryIds
      .filter((id) => categoryMap.has(id)) // 存在するカテゴリのみフィルタリング
      .map((id) => categoryMap.get(id)!);

    // 順序情報にないカテゴリ（新しく追加されたものなど）を末尾に追加
    const unsortedCategories = categories.filter(
      (category) => !categoryIds.includes(category.id)
    );

    return [...sortedCategories, ...unsortedCategories];
  } catch (error) {
    console.error("並び替えしたカテゴリの取得に失敗しました", error);
    return [];
  }
};

// =====更新メソッド=====

export const editCategory = async (
  uid: string,
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<CategoryResult> => {
  // バリデーションチェック（部分更新の場合はpartialなスキーマを使用する必要があるかもしれません）
  const validation = categorySchema.partial().safeParse(categoryData);
  if (!validation.success) {
    return {
      error: true,
      message: validation.error.issues[0]?.message ?? "エラー発生",
    };
  }

  try {
    // データ層を呼び出して更新
    await updateCategory(uid, categoryId, categoryData);

    return {
      id: categoryId,
    };
  } catch (error) {
    console.error(`カテゴリーID ${categoryId}の更新に失敗しました:`, error);
    return {
      error: true,
      message: "カテゴリーの更新に失敗しました",
    };
  }
};

// =====削除メソッド=====
export const removeCategory = async (
  uid: string,
  categoryId: string
): Promise<CategoryResult> => {
  try {
    // 1. カテゴリに属する全商品を取得
    const products = await fetchProductsInCategory(uid, categoryId);

    // 2. 商品とその順序情報を削除（並行処理で効率化）
    if (products.length > 0) {
      const productDeletionPromises = products.map((product) =>
        removeProduct(uid, categoryId, product)
      );
      await Promise.all(productDeletionPromises);
    }

    // 3. 商品順序情報のカテゴリフィールドを削除
    await deleteProductSequence(uid, categoryId);

    // 4. カテゴリ自体を削除
    await deleteCategory(uid, categoryId);

    // 5. カテゴリ順序情報から削除
    await deleteCategorySequence(uid, categoryId);

    return {
      id: categoryId,
    };
  } catch (error) {
    console.error(`カテゴリーID ${categoryId}の削除に失敗しました:`, error);
    return {
      error: true,
      message: "商品カテゴリーの削除に失敗しました",
    };
  }
};
