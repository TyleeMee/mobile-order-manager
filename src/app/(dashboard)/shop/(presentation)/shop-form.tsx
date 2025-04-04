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

import ImageUploader from "@/components/image-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import { shopSchema } from "@/validation/shop-schema";

import { storage } from "../../../../../firebase/client";
import { Button } from "../../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../../components/ui/form";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Textarea } from "../../../../components/ui/textarea";
import { ShopFormValues } from "../(domain)/shop";

type Props = {
  submitButtonLabel: React.ReactNode;
  handleSubmit: (data: z.infer<typeof shopSchema>) => void;
  defaultValues?: Partial<ShopFormValues>;
};

export default function ShopForm({
  handleSubmit,
  submitButtonLabel,
  defaultValues,
}: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const combinedDefaultValues: ShopFormValues = {
    ...{
      title: "",
      imageUrl: "",
      imagePath: "",
      description: "",
      prefecture: "東京都",
      city: "",
      streetAddress: "",
      building: "",
      isVisible: false,
      isOrderAccepting: true,
    },
    ...defaultValues,
  };

  const form = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    defaultValues: combinedDefaultValues,
  });

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const onSubmit = async (_data: z.infer<typeof shopSchema>) => {
    try {
      // 新しい画像ファイルがある場合は処理
      if (imageFile) {
        setIsUploading(true);
        const storagePath = `shops/${Date.now()}_${imageFile.name}`;
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
      const updatedData = form.getValues();

      // 「pending-upload」のままの場合はエラーとして扱う
      if (
        updatedData.imageUrl === "pending-upload" ||
        updatedData.imagePath === "pending-upload"
      ) {
        throw new Error("画像のアップロードが完了していません");
      }

      await handleSubmit(updatedData);
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
                <FormLabel>店名</FormLabel>
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
                <FormLabel>店舗画像</FormLabel>
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
                <FormLabel>店舗説明</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} className="resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prefecture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>都道府県</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <>
                        <SelectItem value="北海道">北海道</SelectItem>
                        <SelectItem value="青森県">青森県</SelectItem>
                        <SelectItem value="岩手県">岩手県</SelectItem>
                        <SelectItem value="宮城県">宮城県</SelectItem>
                        <SelectItem value="秋田県">秋田県</SelectItem>
                        <SelectItem value="山形県">山形県</SelectItem>
                        <SelectItem value="福島県">福島県</SelectItem>
                        <SelectItem value="茨城県">茨城県</SelectItem>
                        <SelectItem value="栃木県">栃木県</SelectItem>
                        <SelectItem value="群馬県">群馬県</SelectItem>
                        <SelectItem value="埼玉県">埼玉県</SelectItem>
                        <SelectItem value="千葉県">千葉県</SelectItem>
                        <SelectItem value="東京都">東京都</SelectItem>
                        <SelectItem value="神奈川県">神奈川県</SelectItem>
                        <SelectItem value="新潟県">新潟県</SelectItem>
                        <SelectItem value="富山県">富山県</SelectItem>
                        <SelectItem value="石川県">石川県</SelectItem>
                        <SelectItem value="福井県">福井県</SelectItem>
                        <SelectItem value="山梨県">山梨県</SelectItem>
                        <SelectItem value="長野県">長野県</SelectItem>
                        <SelectItem value="岐阜県">岐阜県</SelectItem>
                        <SelectItem value="静岡県">静岡県</SelectItem>
                        <SelectItem value="愛知県">愛知県</SelectItem>
                        <SelectItem value="三重県">三重県</SelectItem>
                        <SelectItem value="滋賀県">滋賀県</SelectItem>
                        <SelectItem value="京都府">京都府</SelectItem>
                        <SelectItem value="大阪府">大阪府</SelectItem>
                        <SelectItem value="兵庫県">兵庫県</SelectItem>
                        <SelectItem value="奈良県">奈良県</SelectItem>
                        <SelectItem value="和歌山県">和歌山県</SelectItem>
                        <SelectItem value="鳥取県">鳥取県</SelectItem>
                        <SelectItem value="島根県">島根県</SelectItem>
                        <SelectItem value="岡山県">岡山県</SelectItem>
                        <SelectItem value="広島県">広島県</SelectItem>
                        <SelectItem value="山口県">山口県</SelectItem>
                        <SelectItem value="徳島県">徳島県</SelectItem>
                        <SelectItem value="香川県">香川県</SelectItem>
                        <SelectItem value="愛媛県">愛媛県</SelectItem>
                        <SelectItem value="高知県">高知県</SelectItem>
                        <SelectItem value="福岡県">福岡県</SelectItem>
                        <SelectItem value="佐賀県">佐賀県</SelectItem>
                        <SelectItem value="長崎県">長崎県</SelectItem>
                        <SelectItem value="熊本県">熊本県</SelectItem>
                        <SelectItem value="大分県">大分県</SelectItem>
                        <SelectItem value="宮崎県">宮崎県</SelectItem>
                        <SelectItem value="鹿児島県">鹿児島県</SelectItem>
                        <SelectItem value="沖縄県">沖縄県</SelectItem>
                      </>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>市町村区</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>町域・番地</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="building"
            render={({ field }) => (
              <FormItem>
                <FormLabel>建物名など</FormLabel>
                <FormControl>
                  <Input {...field} />
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
