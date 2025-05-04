import { fetchWithAuth } from "./api-client";
import { ShopFormValues } from "@/models/shop";

// 店舗データ取得API
export const getShop = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/shop", token);
    return response;
  } catch (error) {
    console.error("店舗データの取得に失敗しました:", error);
    // エラーメッセージが「APIエラー: 404」を含むか確認
    if (error instanceof Error && error.message.includes("APIエラー: 404")) {
      console.log("404エラーを検出しました。nullを返します");
      return null;
    }

    throw error;
  }
};

// 店舗作成API (FormData対応)
export const createShop = async (token: string | null, formData: FormData) => {
  try {
    return fetchWithAuth("/api/shop", token, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("店舗データの作成に失敗しました:", error);
    throw error;
  }
};

// 店舗作成API (JSON対応) - 既存のものを残す
export const createShopJSON = async (
  token: string | null,
  shopData: ShopFormValues
) => {
  try {
    return fetchWithAuth("/api/shop", token, {
      method: "POST",
      body: JSON.stringify(shopData),
    });
  } catch (error) {
    console.error("店舗データの作成に失敗しました:", error);
    throw error;
  }
};

// 店舗更新API (FormData対応)
export const editShop = async (token: string | null, formData: FormData) => {
  try {
    return fetchWithAuth("/api/shop", token, {
      method: "PUT",
      body: formData,
    });
  } catch (error) {
    console.error("店舗データの更新に失敗しました:", error);
    throw error;
  }
};

// 店舗更新API (JSON対応) - 既存のものを残す
export const editShopJSON = async (
  token: string | null,
  shopData: ShopFormValues
) => {
  try {
    return fetchWithAuth("/api/shop", token, {
      method: "PUT",
      body: JSON.stringify(shopData),
    });
  } catch (error) {
    console.error("店舗データの更新に失敗しました:", error);
    throw error;
  }
};
