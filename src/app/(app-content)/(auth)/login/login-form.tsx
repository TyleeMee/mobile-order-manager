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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { loginUserSchema } from "@/validation/auth-user-schema";
import { getCognitoErrorMessage } from "@/lib/error-messages/cognito-errors";

export default function LoginForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof loginUserSchema>) => {
    try {
      await auth?.loginWithEmail(data.email, data.password);
      //   router.refresh();
    } catch (error: any) {
      console.error("ログイン処理中にエラーが発生しました:", error);

      // エラーメッセージを適切に処理
      let errorMessage = "ログインに失敗しました。";

      if (error.code) {
        errorMessage = getCognitoErrorMessage(error.code);
      } else if (error.message) {
        if (error.message.includes("Incorrect username or password")) {
          errorMessage = "メールアドレスまたはパスワードが間違っています";
        } else if (error.message.includes("User is not confirmed")) {
          errorMessage =
            "メールアドレスが確認されていません。確認メールをご確認ください";
        }
      }

      toast({
        title: "ログインエラー",
        description: errorMessage,
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
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Input {...field} placeholder="メールアドレス" />
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
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="パスワード（半角英数字6文字以上）"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit">ログイン</Button>
        </fieldset>
      </form>
    </Form>
  );
}
