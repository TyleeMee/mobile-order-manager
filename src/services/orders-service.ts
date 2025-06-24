import { fetchWithAuth } from "./api-client";
import { Order, OrderWithProductTitles } from "@/models/order";

// 全注文取得API
export const getOrders = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/orders", token);
    return response as OrderWithProductTitles[];
  } catch (error) {
    console.error("注文一覧の取得に失敗しました:", error);
    throw error;
  }
};

// 新規注文取得API
export const getNewOrders = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/orders/new", token);
    return response as OrderWithProductTitles[];
  } catch (error) {
    console.error("新規注文の取得に失敗しました:", error);
    throw error;
  }
};

// 過去注文取得API
export const getPastOrders = async (token: string | null) => {
  try {
    const response = await fetchWithAuth("/api/orders/past", token);
    return response as OrderWithProductTitles[];
  } catch (error) {
    console.error("過去注文の取得に失敗しました:", error);
    throw error;
  }
};

// 特定の注文取得API
export const getOrderById = async (token: string | null, id: string) => {
  try {
    const response = await fetchWithAuth(`/api/orders/${id}`, token);
    return response as OrderWithProductTitles;
  } catch (error) {
    console.error(`注文(ID: ${id})の取得に失敗しました:`, error);
    throw error;
  }
};

// 注文ステータス更新API
export const updateOrderStatus = async (
  token: string | null,
  id: string,
  orderStatus: string
) => {
  try {
    return fetchWithAuth(`/api/orders/${id}/status`, token, {
      method: "PUT",
      body: JSON.stringify({ orderStatus }),
    });
  } catch (error) {
    console.error(`注文(ID: ${id})のステータス更新に失敗しました:`, error);
    throw error;
  }
};
