import {
  addIdToProductSequence,
  deleteIdFromProductSequence,
  fetchProductSequence,
} from "../repositories/productSequencesRepository";
import {
  addProduct,
  deleteProduct,
  fetchProductById,
  fetchProductsInCategory,
  updateProduct,
} from "../repositories/productsRepository";
import { Product, ProductData, ProductResult } from "../models/Product";
import { formatZodError, productSchema } from "@/validation/productSchema";
import { deleteImageFromS3, uploadImageToS3 } from "@/utils/s3";

// =====作成メソッド=====

export const createProductWithImage = async (
  uid: string,
  categoryId: string,
  productData: Partial<ProductData>,
  imageFile?: Express.Multer.File
): Promise<ProductResult> => {
  try {
    // バリデーション（画像ファイルがある場合は画像URLとパスの検証をスキップ）
    const validationSchema = imageFile
      ? productSchema.omit({ imageUrl: true, imagePath: true })
      : productSchema;

    const validation = validationSchema.safeParse(productData);
    if (!validation.success) {
      return formatZodError(validation.error);
    }

    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        const { imageUrl, imagePath } = await uploadImageToS3(
          imageFile,
          uid,
          "products"
        );
        productData.imageUrl = imageUrl;
        productData.imagePath = imagePath;
      } catch (error) {
        return {
          error: true,
          message:
            error instanceof Error
              ? error.message
              : "画像のアップロードに失敗しました",
        };
      }
    }

    // ownerId を追加
    productData.ownerId = uid;

    //データ層を呼び出してProductを作成
    const productId = await addProduct(
      uid,
      categoryId,
      productData as ProductData
    );

    // sortSequencesコレクションに新しいカテゴリーidを追加（末尾に追加）
    await addIdToProductSequence(uid, categoryId, productId);

    return {
      id: productId,
    };
  } catch (error) {
    console.error("商品の作成に失敗しました:", error);
    return {
      error: true,
      message:
        error instanceof Error ? error.message : "商品の作成に失敗しました",
    };
  }
};

// =====取得メソッド=====
//TODO バックエンドのservice層の全ての取得メソッド（product以外も）でTimestamp型→Date型 Integer→number型に（多分priceだけ）
//TODO createやupdateでは逆のことはしなくて平気？

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
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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

export const updateProductWithImage = async (
  uid: string,
  productId: string,
  productData: Partial<ProductData>,
  imageFile?: Express.Multer.File,
  oldImagePath?: string
): Promise<ProductResult> => {
  try {
    // バリデーション（部分更新可能）
    const validationSchema = productSchema.partial();
    const validation = validationSchema.safeParse(productData);
    if (!validation.success) {
      return formatZodError(validation.error);
    }

    // 新しい画像ファイルがある場合は処理
    if (imageFile) {
      try {
        const { imageUrl, imagePath } = await uploadImageToS3(
          imageFile,
          uid,
          "products"
        );
        productData.imageUrl = imageUrl;
        productData.imagePath = imagePath;

        // 古い画像が存在する場合は削除
        if (oldImagePath && oldImagePath !== imagePath) {
          await deleteImageFromS3(oldImagePath);
        }
      } catch (error) {
        return {
          error: true,
          message:
            error instanceof Error ? error.message : "画像の処理に失敗しました",
        };
      }
    }

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
  productId: string,
  imagePath?: string
): Promise<ProductResult> => {
  try {
    // 製品を削除
    await deleteProduct(uid, productId);

    // 製品の並び順情報からも削除する
    await deleteIdFromProductSequence(uid, categoryId, productId);

    // S3から画像を削除
    if (imagePath) {
      await deleteImageFromS3(imagePath);
    }

    return {
      id: productId,
    };
  } catch (error) {
    console.error(`商品ID ${productId}の削除に失敗しました:`, error);
    return {
      error: true,
      message: "商品の削除に失敗しました",
    };
  }
};
