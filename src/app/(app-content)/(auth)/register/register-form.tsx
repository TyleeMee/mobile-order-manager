"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ContinueWithGoogleButton from "@/components/continue-with-google-button";
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
import { useAuth } from "@/contexts/auth-context-firebase";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseErrorInfo } from "@/lib/error-messages/firebase-client-errors";
import { registerUserSchema } from "@/validation/auth-user-schema";

import { createFirebaseUser } from "../(application)/auth-service";

export default function RegisterForm() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof registerUserSchema>>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      name: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof registerUserSchema>) => {
    const response = await createFirebaseUser(data);

    if (!!response?.error) {
      toast({
        title: "エラー",
        description: response.message ?? "アカウントの新規作成に失敗しました",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "アカウントを新規作成しました",
      //   description: "Your account was created successfully!",
      variant: "success",
    });

    try {
      await auth?.loginWithEmail(data.email, data.password);
      router.refresh();
    } catch (error: unknown) {
      // エラーから日本語メッセージを取得
      const errorInfo = getFirebaseErrorInfo(error);

      toast({
        title: "ログインエラー",
        description: errorInfo.message,
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
          <div className="text-center pb-6">or</div>
        </fieldset>
      </form>
      <ContinueWithGoogleButton />
    </Form>
  );
}
