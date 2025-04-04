import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "入力してください"),
  imageUrl: z.string().min(1, "画像をアップロードしてください"),
  imagePath: z.string().min(1, "画像をアップロードしてください"),
  description: z.string().optional(),
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
});
