import { Timestamp } from "firebase-admin/firestore";

/// Timestamp型のフィールドを検出してDate型に変換
export function formatFirestoreData<T extends Record<string, unknown>>(
  data: Record<string, unknown>
): T {
  const formatted = { ...data };

  // Timestamp型のフィールドを検出して変換
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Timestamp) {
      formatted[key] = value.toDate();
    }
  });

  return formatted as T;
}
