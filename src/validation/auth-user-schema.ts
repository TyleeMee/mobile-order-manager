import { z } from "zod";

export const passwordValidation = z.string().refine(
  (value) => {
    const regex = /^[\x20-\x7E]{6,}$/;
    return regex.test(value);
  },
  {
    message: "パスワードは6文字以上の半角英数字を入力してください。",
  }
);

export const registerUserSchema = z
  .object({
    email: z.string().email("メールアドレスの形式が正しくありません"),
    name: z.string().min(1, "名前を入力してください"),
    password: passwordValidation,
    passwordConfirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        message: "パスワードが一致しません",
        path: ["passwordConfirm"],
        code: "custom",
      });
    }
  });

export const loginUserSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: passwordValidation,
});
