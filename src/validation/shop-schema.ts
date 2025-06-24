import { z } from "zod";

export const shopObjectSchema = z.object({
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
  prefecture: z.enum([
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
  ]),
  city: z
    .string()
    .min(1, "入力してください")
    .max(100, "市区町村は100文字以内で入力してください"),
  streetAddress: z
    .string()
    .min(1, "入力してください")
    .max(200, "番地は200文字以内で入力してください"),
  building: z
    .string()
    .max(200, "建物名は200文字以内で入力してください")
    .optional(),
  isVisible: z.boolean().default(false),
  isOrderAccepting: z.boolean().default(false),
  _hasImageFile: z.boolean().optional(),
});

// バリデーションルールを追加したスキーマ
export const shopSchema = shopObjectSchema.refine(
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
