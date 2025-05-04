import { useAuthToken } from "@/auth/hooks/use-auth-token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// トークン付きでのリクエスト
export const fetchWithAuth = async (
  endpoint: string,
  token: string | null,
  options: RequestInit = {}
) => {
  if (!token) {
    console.error("認証トークンが指定されていません");
    throw new Error("認証トークンが取得できませんでした");
  }

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  });

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`APIエラー: ${response.status}`);
  }

  return response.json();
};
