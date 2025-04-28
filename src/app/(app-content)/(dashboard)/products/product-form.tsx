"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { productSchema } from "@/validation/product-schema";

import ImageUploader from "@/components/image-uploader";
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
import { Textarea } from "@/components/ui/textarea";
import { ProductFormValues } from "@/models/product";

type Props = {
  submitButtonLabel: React.ReactNode;
  handleSubmitAction: (data: FormData) => Promise<void>;
  defaultValues?: Partial<ProductFormValues>;
};

export default function ProductForm({
  handleSubmitAction,
  submitButtonLabel,
  defaultValues,
}: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const combinedDefaultValues: ProductFormValues = {
    ...{
      title: "",
      imageUrl: "",
      imagePath: "",
      description: "",
      price: undefined,
      isVisible: false,
      isOrderAccepting: true,
    },
    ...defaultValues,
  };

  // デフォルト値がある場合は_hasImageFileをtrueに設定
  const hasDefaultImage = !!(
    combinedDefaultValues.imageUrl || combinedDefaultValues.imagePath
  );

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...combinedDefaultValues,
      _hasImageFile: hasDefaultImage,
    },
  });

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
    // ファイルの有無を示す隠しフィールドを設定
    form.setValue("_hasImageFile", !!file);

    // バリデーションを再実行
    form.trigger("imageUrl");
  };

  const onSubmit = async (_data: z.infer<typeof productSchema>) => {
    try {
      setIsUploading(true);

      // FormDataオブジェクトを作成
      const formData = new FormData();

      // フォームの値をFormDataに追加
      const formValues = form.getValues();
      Object.entries(formValues).forEach(([key, value]) => {
        // booleanの場合は文字列に変換
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        }
        // 数値の場合は文字列に変換
        else if (typeof value === "number") {
          formData.append(key, value.toString());
        }
        // 値が存在する場合のみ追加
        else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      // 画像ファイルがある場合
      if (imageFile) {
        formData.append("imageFile", imageFile);

        // 既存の画像がある場合は古いパスも送信
        if (combinedDefaultValues.imagePath) {
          formData.append("oldImagePath", combinedDefaultValues.imagePath);
        }
      }

      // フォーム送信（FormDataをそのまま渡す）
      await handleSubmitAction(formData);
    } catch (error) {
      console.error("フォーム送信エラー:", error);

      form.setError("root.serverError", {
        type: "manual",
        message: "商品情報の保存に失敗しました。再度お試しください。",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset
          className="flex flex-col gap-2"
          disabled={form.formState.isSubmitting || isUploading}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品名</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* 画像アップロード部分 */}
          <FormField
            control={form.control}
            name="imageUrl"
            render={() => (
              <FormItem>
                <FormLabel>商品画像</FormLabel>
                <FormControl>
                  <ImageUploader
                    form={form}
                    defaultImageUrl={combinedDefaultValues.imageUrl}
                    onImageFileChange={handleImageFileChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品説明</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>価格（税込）</FormLabel>
                <FormControl>
                  <Input {...field} type="number" value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <>
                <FormItem>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isVisible"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="isVisible"
                        className="text-sm font-medium"
                      >
                        公開する
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
                {/* isVisible が true のときだけ表示 */}
                {field.value && (
                  <FormField
                    control={form.control}
                    name="isOrderAccepting"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="isOrderAccepting"
                              checked={!field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(!checked);
                              }}
                            />
                            <label
                              htmlFor="isOrderAccepting"
                              className="text-sm font-medium"
                            >
                              注文の受付を停止する
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          />
        </fieldset>
        <Button
          type="submit"
          className="max-w-md mx-auto mt-2 w-full flex gap-2"
          disabled={form.formState.isSubmitting || isUploading}
        >
          {isUploading ? "アップロード中..." : submitButtonLabel}
        </Button>
      </form>
    </Form>
  );
}
