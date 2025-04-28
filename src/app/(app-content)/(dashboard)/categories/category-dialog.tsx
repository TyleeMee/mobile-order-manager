"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { cloneElement, ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categorySchema } from "@/validation/category-schema";

import { CategoryData } from "@/models/category";

// ボタン要素の型を定義
type ButtonElement = ReactElement<{
  onClick?: () => void;
  [key: string]: unknown;
}>;

type Props = {
  handleSubmitAction: (data: z.infer<typeof categorySchema>) => void;
  triggerButton: ButtonElement;
  defaultValues?: Partial<CategoryData>;
};

export default function CategoryDialog({
  handleSubmitAction,
  triggerButton,
  defaultValues,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const combinedDefaultValues: CategoryData = {
    ...{
      title: "",
    },
    ...defaultValues,
  };

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: combinedDefaultValues,
  });

  const onSubmit = async (data: z.infer<typeof categorySchema>) => {
    try {
      setIsSubmitting(true);
      // APIリクエストなどの非同期処理
      await handleSubmitAction(data);
      // 成功したらダイアログを閉じる
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      // エラー処理
    } finally {
      setIsSubmitting(false);
    }
  };

  // triggerButtonをクローンして、onClick属性を追加
  const buttonWithClickHandler = cloneElement(triggerButton, {
    onClick: () => setOpen(true),
  });

  return (
    <>
      {/* open=falseの時は、buttonのみ表示 */}
      {buttonWithClickHandler}

      {/* 以下open=trueの時のみDialog表示 */}
      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          // 送信中は閉じられないようにする
          if (isSubmitting && !newOpen) return;
          setOpen(newOpen);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>商品カテゴリー</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <fieldset className="flex flex-col gap-2" disabled={isSubmitting}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリー名</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="フード、ドリンク、サイドメニューなど"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>

              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  //   variant="outline"
                  // className="max-w-md mx-auto mt-2 w-full flex gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "送信中..." : "保存"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
