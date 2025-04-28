import { fetchWithAuth } from "./api-client";
import { CategoryData, CategoryResult, Category } from "@/models/category";

// カテゴリー一覧取得API
export const getCategories = async () => {
  try {
    const response = await fetchWithAuth("/api/categories");
    return response;
  } catch (error) {
    console.error("カテゴリー一覧の取得に失敗しました:", error);
    throw error;
  }
};

// 特定のカテゴリー取得API
export const getCategory = async (id: string) => {
  try {
    const response = await fetchWithAuth(`/api/categories/${id}`);
    return response;
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の取得に失敗しました:`, error);
    throw error;
  }
};

// カテゴリー作成API
export const createCategory = async (categoryData: CategoryData) => {
  try {
    return fetchWithAuth("/api/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    console.error("カテゴリーの作成に失敗しました:", error);
    throw error;
  }
};

// カテゴリー更新API
export const editCategory = async (id: string, categoryData: CategoryData) => {
  try {
    return fetchWithAuth(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の更新に失敗しました:`, error);
    throw error;
  }
};

// カテゴリー削除API
export const deleteCategory = async (id: string) => {
  try {
    return fetchWithAuth(`/api/categories/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`カテゴリー(ID: ${id})の削除に失敗しました:`, error);
    throw error;
  }
};
