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

import { storage } from "../../../../../../firebase/client";
import ImageUploader from "../../../../../components/image-uploader";
import { Button } from "../../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../../components/ui/form";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { ProductFormValues } from "../(domain)/product";

type Props = {
  submitButtonLabel: React.ReactNode;
  handleSubmitAction: (data: z.infer<typeof productSchema>) => void;
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

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: combinedDefaultValues,
  });

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const onSubmit = async (_data: z.infer<typeof productSchema>) => {
    try {
      //TODO (注意)クライアントサイドでの画像登録・削除のロジック
      // 新しい画像ファイルがある場合は処理
      if (imageFile) {
        setIsUploading(true);
        const storagePath = `products/${Date.now()}_${imageFile.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        // 画像アップロード完了を待つ
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            () => {},
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              form.setValue("imageUrl", downloadURL);
              form.setValue("imagePath", storagePath);
              resolve();
            }
          );
          uploadTask.then();
        });

        // 古い画像が存在する場合は削除
        if (
          combinedDefaultValues.imagePath &&
          combinedDefaultValues.imagePath !== "" &&
          combinedDefaultValues.imagePath !== storagePath
        ) {
          try {
            const oldImageRef = ref(storage, combinedDefaultValues.imagePath);
            await deleteObject(oldImageRef);
            console.log(
              "古い画像を削除しました:",
              combinedDefaultValues.imagePath
            );
          } catch (deleteError) {
            console.error("古い画像の削除に失敗しました:", deleteError);
            // 削除に失敗しても処理は続行
          }
        }
      }

      // 画像URLが更新された最新のフォームデータを取得
      const formData = form.getValues();

      // 価格を明示的に数値に変換する
      const updatedData = {
        ...formData,
        price: Number(formData.price),
      };

      // 「pending-upload」のままの場合はエラーとして扱う
      if (
        updatedData.imageUrl === "pending-upload" ||
        updatedData.imagePath === "pending-upload"
      ) {
        throw new Error("画像のアップロードが完了していません");
      }

      await handleSubmitAction(updatedData);
    } catch (error) {
      console.error("画像アップロードエラー:", error);

      // エラー発生時に仮の値がある場合は空に戻す
      const currentImageUrl = form.getValues("imageUrl");
      const currentImagePath = form.getValues("imagePath");

      if (currentImageUrl === "pending-upload") {
        // エラー時は元の値に戻す
        form.setValue("imageUrl", combinedDefaultValues.imageUrl || "");
        form.setError("imageUrl", {
          type: "manual",
          message: "画像のアップロードに失敗しました。再度お試しください。",
        });
      }

      if (currentImagePath === "pending-upload") {
        form.setValue("imagePath", combinedDefaultValues.imagePath || "");
      }
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
