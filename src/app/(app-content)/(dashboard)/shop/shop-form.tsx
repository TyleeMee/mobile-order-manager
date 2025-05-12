"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ImageUploader from "@/components/image-uploader";
import { Checkbox } from "@/components/ui/checkbox";
import { shopSchema } from "@/validation/shop-schema";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShopFormValues } from "@/models/shop";
import { toast } from "@/hooks/use-toast";

type Props = {
  submitButtonLabel: React.ReactNode;
  handleSubmitAction: (data: FormData) => Promise<void>; // FormDataを受け取るように変更
  defaultValues?: Partial<ShopFormValues>;
};

export default function ShopForm({
  handleSubmitAction,
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

  // デフォルト値がある場合は_hasImageFileをtrueに設定
  const hasDefaultImage = !!(
    combinedDefaultValues.imageUrl || combinedDefaultValues.imagePath
  );

  const form = useForm<z.infer<typeof shopSchema>>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      ...combinedDefaultValues,
      _hasImageFile: hasDefaultImage, // デフォルト画像がある場合はtrueを設定
    },
  });

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
    // ファイルの有無を示す隠しフィールドを設定
    form.setValue("_hasImageFile", !!file);

    // バリデーションを再実行
    form.trigger("imageUrl");
  };

  const onSubmit = async (_data: z.infer<typeof shopSchema>) => {
    try {
      setIsUploading(true);

      // FormDataオブジェクトを作成
      const formData = new FormData();

      // フォームの値をFormDataに追加
      const formValues = form.getValues();

      console.log("フォーム値:", formValues);

      Object.entries(formValues).forEach(([key, value]) => {
        // _hasImageFileと内部フィールドはスキップ
        if (key === "_hasImageFile" || key.startsWith("_")) {
          return;
        }
        // pending-uploadはスキップする（imageUrlとimagePathに対して）
        if (value === "pending-upload") {
          return;
        }
        // booleanの場合は文字列に変換
        if (typeof value === "boolean") {
          formData.append(key, value.toString());
        }
        // 値が存在する場合のみ追加
        else if (value !== undefined && value !== null) {
          formData.append(key, value as string);
        }
      });

      // 画像ファイルがある場合
      if (imageFile) {
        // 詳細な画像ファイル情報をログに出力
        console.log("画像ファイル情報:", {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size,
          lastModified: new Date(imageFile.lastModified).toISOString(),
        });

        // 画像の先頭バイトを検証するための処理
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = function (e) {
            if (e.target && e.target.result) {
              const view = new Uint8Array(e.target.result as ArrayBuffer);

              // 先頭16バイトを16進数で表示
              const headerBytes = Array.from(view.slice(0, 16))
                .map((b) => b.toString(16).padStart(2, "0"))
                .join(" ");
              console.log(`フォーム送信直前の画像ヘッダー: ${headerBytes}`);

              // JPEGシグネチャの検証
              if (imageFile.type === "image/jpeg") {
                const isValidJpeg = view[0] === 0xff && view[1] === 0xd8;
                console.log(`有効なJPEGシグネチャ: ${isValidJpeg}`);

                if (!isValidJpeg) {
                  console.error(
                    "警告: JPEGファイルが無効なシグネチャを持っています"
                  );
                }
              }

              // PNGシグネチャの検証
              if (imageFile.type === "image/png") {
                const pngSignature = [
                  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
                ];
                const isValidPng = pngSignature.every(
                  (byte, i) => view[i] === byte
                );
                console.log(`有効なPNGシグネチャ: ${isValidPng}`);

                if (!isValidPng) {
                  console.error(
                    "警告: PNGファイルが無効なシグネチャを持っています"
                  );
                }
              }

              resolve();
            } else {
              console.error("ファイルの読み込みに失敗しました");
              resolve();
            }
          };

          reader.onerror = function () {
            console.error("ファイル読み込みエラー:", reader.error);
            resolve();
          };

          // ファイルの先頭部分のみを読み込む
          reader.readAsArrayBuffer(imageFile.slice(0, 16));
        });

        // FormDataに画像ファイルを追加
        formData.append("imageFile", imageFile);

        // 既存の画像がある場合は古いパスも送信
        if (combinedDefaultValues.imagePath) {
          formData.append("oldImagePath", combinedDefaultValues.imagePath);
        }
      } else {
        console.log("画像ファイルなし: 新しい画像はアップロードされません");
      }

      // FormDataの内容をデバッグログに出力
      console.log("FormData内容:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: [File] 名前=${value.name}, サイズ=${value.size}バイト, タイプ=${value.type}`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // APIリクエスト開始をログに記録
      console.log("API送信開始...");

      // フォーム送信（FormDataをそのまま渡す）
      const result = await handleSubmitAction(formData);

      console.log("API送信完了:", result);
    } catch (error) {
      console.error("フォーム送信エラー:", error);

      form.setError("root.serverError", {
        type: "manual",
        message: "店舗情報の保存に失敗しました。再度お試しください。",
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
