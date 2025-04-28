import { fetchWithAuth } from "./api-client";
import { ShopFormValues } from "@/models/shop";

// 店舗データ取得API
export const getShop = async () => {
  try {
    const response = await fetchWithAuth("/api/shop");
    return response;
  } catch (error) {
    console.error("店舗データの取得に失敗しました:", error);
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
};

// 店舗作成API (FormData対応)
export const createShop = async (formData: FormData) => {
  try {
    return fetchWithAuth("/api/shop", {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("店舗データの作成に失敗しました:", error);
    throw error;
  }
};

// 店舗作成API (JSON対応) - 既存のものを残す
export const createShopJSON = async (shopData: ShopFormValues) => {
  try {
    return fetchWithAuth("/api/shop", {
      method: "POST",
      body: JSON.stringify(shopData),
    });
  } catch (error) {
    console.error("店舗データの作成に失敗しました:", error);
    throw error;
  }
};

// 店舗更新API (FormData対応)
export const editShop = async (formData: FormData) => {
  try {
    return fetchWithAuth("/api/shop", {
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    console.error("店舗データの更新に失敗しました:", error);
    throw error;
  }
};

// 店舗更新API (JSON対応) - 既存のものを残す
export const editShopJSON = async (shopData: ShopFormValues) => {
  try {
    return fetchWithAuth("/api/shop", {
      method: "PUT",
      body: JSON.stringify(shopData),
    });
  } catch (error) {
    console.error("店舗データの更新に失敗しました:", error);
    throw error;
  }
};
