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

  // デバッグ用: リクエストの詳細をログ出力
  console.log("[API-CLIENT] リクエスト情報:", {
    endpoint,
    method: options.method || "GET",
    bodyType: options.body
      ? options.body instanceof FormData
        ? "FormData"
        : typeof options.body
      : "なし",
    bodySize:
      options.body instanceof FormData
        ? "[FormData形式]"
        : typeof options.body === "string"
        ? options.body.length
        : "不明",
    現在のヘッダー: options.headers,
  });

  const headers = new Headers({
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  });

  // FormDataの場合はContent-Type設定をスキップ（ブラウザが自動設定）
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    console.log(
      "[API-CLIENT] JSONデータ用のContent-Type: application/jsonを設定"
    );
  } else {
    console.log("[API-CLIENT] FormDataのため、Content-Typeは自動設定されます");

    // FormDataの中身をログ出力（デバッグ用）
    console.log("[API-CLIENT] FormData内容:");
    const formData = options.body as FormData;
    for (const pair of (formData as any).entries()) {
      if (pair[0] === "imageFile") {
        console.log(
          `${pair[0]}: [ファイル] type=${pair[1].type}, size=${pair[1].size}バイト, name=${pair[1].name}`
        );
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
  }

  // リクエスト送信前に最終的なヘッダーをログ出力
  console.log("[API-CLIENT] 最終ヘッダー:");
  headers.forEach((value, key) => {
    console.log(
      `${key}: ${key.toLowerCase() === "authorization" ? "(隠蔽)" : value}`
    );
  });

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log("[API-CLIENT] レスポンス:", {
    ステータス: response.status,
    ステータステキスト: response.statusText,
    タイプ: response.type,
    URL: response.url,
    コンテンツタイプ: response.headers.get("content-type"),
  });

  if (!response.ok) {
    // エラーレスポンスの詳細を取得
    try {
      const errorText = await response.text();
      console.error(`[API-CLIENT] APIエラー詳細: ${errorText}`);
    } catch (e) {
      console.error("[API-CLIENT] APIエラーですが、詳細を取得できませんでした");
    }
    throw new Error(`APIエラー: ${response.status}`);
  }

  return response.json();
};
