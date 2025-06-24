import {
  deleteProduct,
  fetchProductsInCategory,
} from "../repositories/productsRepository";
import { CategoryData, CategoryResult } from "../models/Category";
import {
  addCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoryById,
  updateCategory,
} from "../repositories/categoriesRepository";
import {
  addCategorySequence,
  deleteCategorySequence,
  fetchCategorySequence,
} from "../repositories/categorySequenceRepository";
import { deleteProductSequence } from "../repositories/productSequencesRepository";

//TODO
// Productのインポートとリポジトリメソッドはここでは省略
// 実際の実装時にはこれらのメソッドも作成する必要があります
// 例:
// import { fetchProductsInCategory } from "../repositories/productRepository";
// import { deleteProductSequence } from "../repositories/productSequenceRepository";

/**
 * カテゴリー関連のビジネスロジック
 */

//=====作成系メソッド=====
export const createCategory = async (
  ownerId: string,
  categoryData: CategoryData
): Promise<CategoryResult> => {
  try {
    // コントローラー層でバリデーション済みのデータを受け取る

    // カテゴリーを作成
    const categoryId = await addCategory(ownerId, categoryData);

    // 順序リストに追加
    await addCategorySequence(ownerId, categoryId);

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
export const getCategory = async (ownerId: string, categoryId: string) => {
  try {
    const category = await fetchCategoryById(ownerId, categoryId);
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
export const getSortedCategories = async (ownerId: string) => {
  try {
    // カテゴリデータと順序情報を並行して取得
    const [categories, categoryIds] = await Promise.all([
      fetchCategories(ownerId),
      fetchCategorySequence(ownerId),
    ]);

    // 順序情報がない場合はデフォルトの順序（更新日時の降順）でカテゴリを返す
    if (!categoryIds || categoryIds.length === 0) {
      return categories.sort(
        (a, b) =>
          (b.updatedAt as Date).getTime() - (a.updatedAt as Date).getTime()
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
  ownerId: string,
  categoryId: string,
  categoryData: Partial<CategoryData>
): Promise<CategoryResult> => {
  try {
    // コントローラー層でバリデーション済みのデータを受け取る
    // データ層を呼び出して更新
    await updateCategory(ownerId, categoryId, categoryData);

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
  ownerId: string,
  categoryId: string
): Promise<CategoryResult> => {
  try {
    // 1. カテゴリに属する全商品を取得
    const products = await fetchProductsInCategory(ownerId, categoryId);

    // 2. 商品とその順序情報を削除
    if (products && products.length > 0) {
      const productDeletionPromises = products.map((product) =>
        deleteProduct(ownerId, product.id)
      );
      await Promise.all(productDeletionPromises);
    }

    // 3. 商品順序情報のカテゴリフィールドを削除
    await deleteProductSequence(ownerId, categoryId);

    // 4. カテゴリ自体を削除
    await deleteCategory(ownerId, categoryId);

    // 5. カテゴリ順序情報から削除
    await deleteCategorySequence(ownerId, categoryId);

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
