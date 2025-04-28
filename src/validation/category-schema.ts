import { z } from "zod";

export const categorySchema = z.object({
  title: z
    .string()
    .min(1, "入力してください")
    .max(255, "255文字以内で入力してください"),
});
