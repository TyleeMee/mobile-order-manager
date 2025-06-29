import { fetchWithAuth } from "./api-client";

// カテゴリー順序取得API
export const getCategorySequence = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/category-sequence", token);
    return response;
  } catch (error) {
    console.error("カテゴリー順序の取得に失敗しました:", error);
    throw error;
  }
};

// カテゴリー順序更新API（全体を更新）
export const updateCategorySequence = async (
  token: string | null,
  categoryIds: string[]
) => {
  try {
    return fetchWithAuth("/api/category-sequence", token, {
      method: "PUT",
      body: JSON.stringify({ categoryIds }),
    });
  } catch (error) {
    console.error("カテゴリー順序の更新に失敗しました:", error);
    throw error;
  }
};
