import { fetchWithAuth } from "./api-client";
import { ProductData, ProductFormValues, Product } from "@/models/product";

// カテゴリ内の商品一覧取得API
export const getProductsInCategory = async (categoryId: string) => {
  try {
    const response = await fetchWithAuth(
      `/api/products/category/${categoryId}`
    );
    return response;
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品一覧取得に失敗しました:`,
      error
    );
    throw error;
  }
};

// 特定の商品取得API
export const getProduct = async (id: string) => {
  try {
    const response = await fetchWithAuth(`/api/products/${id}`);
    return response;
  } catch (error) {
    console.error(`商品(ID: ${id})の取得に失敗しました:`, error);
    throw error;
  }
};

// 商品作成API (FormData対応)
export const createProduct = async (categoryId: string, formData: FormData) => {
  try {
    return fetchWithAuth(`/api/products/category/${categoryId}`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("商品の作成に失敗しました:", error);
    throw error;
  }
};

// 商品作成API (JSON対応)
export const createProductJSON = async (
  categoryId: string,
  productData: ProductFormValues
) => {
  try {
    return fetchWithAuth(`/api/products/category/${categoryId}`, {
      method: "POST",
      body: JSON.stringify(productData),
    });
  } catch (error) {
    console.error("商品の作成に失敗しました:", error);
    throw error;
  }
};

// 商品更新API (FormData対応)
export const editProduct = async (id: string, formData: FormData) => {
  try {
    return fetchWithAuth(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    console.error(`商品(ID: ${id})の更新に失敗しました:`, error);
    throw error;
  }
};

// 商品更新API (JSON対応)
export const editProductJSON = async (
  id: string,
  productData: Partial<ProductFormValues>
) => {
  try {
    return fetchWithAuth(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  } catch (error) {
    console.error(`商品(ID: ${id})の更新に失敗しました:`, error);
    throw error;
  }
};

// 商品削除API
export const deleteProduct = async (
  id: string,
  categoryId: string,
  imagePath?: string
) => {
  try {
    return fetchWithAuth(`/api/products/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ categoryId, imagePath }),
    });
  } catch (error) {
    console.error(`商品(ID: ${id})の削除に失敗しました:`, error);
    throw error;
  }
};
