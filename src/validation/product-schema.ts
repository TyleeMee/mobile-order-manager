import { z } from "zod";

export const productSchema = z
  .object({
    title: z
      .string()
      .min(1, "入力してください")
      .max(255, "255文字以内で入力してください"),
    // バックエンドでの画像処理に対応するための変更
    imageUrl: z.string().optional().or(z.literal("")),
    imagePath: z.string().optional().or(z.literal("")),
    description: z
      .string()
      .max(1000, "説明は1000文字以内で入力してください")
      .optional(),
    price: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z
        .number({
          required_error: "価格を入力してください", // 必須エラーメッセージ
          invalid_type_error: "半角数字を入力してください", // 型が不正な場合のエラーメッセージ
        })
        .int()
        .min(0, "価格は0以上である必要があります")
    ),
    isVisible: z.boolean(),
    isOrderAccepting: z.boolean().default(false),
    _hasImageFile: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.imageUrl || data.imagePath) {
        return true;
      }
      return data._hasImageFile === true;
    },
    {
      message: "画像をアップロードしてください",
      path: ["imageUrl"],
    }
  );
