import { fetchWithAuth } from "./api-client";

// カテゴリ内の商品順序取得API
export const getProductSequence = async (categoryId: string) => {
  try {
    const response = await fetchWithAuth(
      `/api/product-sequences/category/${categoryId}`
    );
    return response;
  } catch (error) {
    console.error(
      `カテゴリID: ${categoryId} の商品順序取得に失敗しました:`,
      error
    );
    throw error;
  }
};

// 商品順序更新API（全体を更新）
export const updateProductSequence = async (
  categoryId: string,
  productIds: string[]
) => {
  try {
    return fetchWithAuth("/api/product-sequences", {
      method: "PUT",
      body: JSON.stringify({ categoryId, productIds }),
    });
  } catch (error) {
    console.error("商品順序の更新に失敗しました:", error);
    throw error;
  }
};
