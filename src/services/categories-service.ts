import { fetchWithAuth } from "./api-client";
import { CategoryData, CategoryResult, Category } from "@/models/category";

// カテゴリー一覧取得API
export const getCategories = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/categories", token);
    return response;
  } catch (error) {
    console.error("カテゴリー一覧の取得に失敗しました:", error);
    throw error;
  }
};

// 特定のカテゴリー取得API
export const getCategory = async (token: string | null, id: string) => {
  try {
    const response = await fetchWithAuth(`/api/categories/${id}`, token);
    return response;
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の取得に失敗しました:`, error);
    throw error;
  }
};

// カテゴリー作成API
export const createCategory = async (
  token: string | null,
  categoryData: CategoryData
) => {
  try {
    return fetchWithAuth("/api/categories", token, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    console.error("カテゴリーの作成に失敗しました:", error);
    throw error;
  }
};

// カテゴリー更新API
export const editCategory = async (
  token: string | null,
  id: string,
  categoryData: CategoryData
) => {
  try {
    return fetchWithAuth(`/api/categories/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の更新に失敗しました:`, error);
    throw error;
  }
};

// カテゴリー削除API
export const deleteCategory = async (token: string | null, id: string) => {
  try {
    return fetchWithAuth(`/api/categories/${id}`, token, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の削除に失敗しました:`, error);
    throw error;
  }
};
