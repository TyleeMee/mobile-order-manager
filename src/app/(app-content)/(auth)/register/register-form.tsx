"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { registerUserSchema } from "@/validation/auth-user-schema";

import { createCognitoUser } from "@/auth/services/auth-service";

export default function RegisterForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    try {
      console.log("送信データ:", data); // 送信データを確認
      const response = await createCognitoUser(data);
      console.log("レスポンス:", response); // 完全なレスポンスを確認

      if (!!response?.error) {
        toast({
          title: "エラー",
          description: response.message ?? "アカウントの新規作成に失敗しました",
          variant: "destructive",
        });
        return;
      }

      //   toast({
      // title: "アカウントを新規作成しました",
      //   description: "Your account was created successfully!",
      //     variant: "success",
      //   });

      // 登録成功後、自動的にログインする
      try {
        await auth?.loginWithEmail(data.email, data.password);

        // ログイン成功後、products ページに遷移
        // router.push("/products");
      } catch (loginError) {
        console.error("自動ログイン中にエラーが発生しました:", loginError);
        toast({
          title: "ログインエラー",
          description:
            "アカウントは作成されましたが、自動ログインに失敗しました。ログインページからログインしてください。",
          variant: "destructive",
        });

        // ログイン失敗時はログインページへ遷移
        router.push("/login");
      }
    } catch (error: unknown) {
      console.error("登録処理中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description:
          error instanceof Error
            ? error.message
            : "アカウント作成中にエラーが発生しました。",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>名前</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>メールアドレス</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>パスワード</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="半角英数字6文字以上"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>パスワード（再入力）</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="半角英数字6文字以上"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit">新規作成する</Button>
        </fieldset>
      </form>
    </Form>
  );
}
