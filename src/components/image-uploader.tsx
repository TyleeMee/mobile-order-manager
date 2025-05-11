"use client";

import { ImagePlus, UploadCloud } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Path, PathValue, UseFormReturn } from "react-hook-form";

// ジェネリック型を使用して、どのスキーマでも使用できるようにする
type ImageUploaderProps<T extends Record<string, unknown>> = {
  form: UseFormReturn<T>;
  defaultImageUrl?: string;
  onImageFileChange: (file: File | null) => void;
  // 必要なフィールド名を指定できるようにする
  imageUrlField?: Path<T>;
  imagePathField?: Path<T>;
};

// ジェネリック型パラメータを追加
const ImageUploader = <T extends Record<string, unknown>>({
  form,
  defaultImageUrl,
  onImageFileChange,
  // デフォルト値を "imageUrl" と "imagePath" に設定
  imageUrlField = "imageUrl" as Path<T>,
  imagePathField = "imagePath" as Path<T>,
}: ImageUploaderProps<T>) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultImageUrl && defaultImageUrl !== "") {
      setImagePreview(defaultImageUrl);
    }
  }, [defaultImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // 型安全にフィールド値を設定
        form.setValue(imageUrlField, "pending-upload" as PathValue<T, Path<T>>);
        form.setValue(
          imagePathField,
          "pending-upload" as PathValue<T, Path<T>>
        );

        // エラーメッセージがあれば消去
        form.clearErrors(imageUrlField);

        // 親コンポーネントにファイルを通知
        onImageFileChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {imagePreview ? (
        <div className="relative w-52 h-52 overflow-hidden rounded-md border">
          <Image
            src={imagePreview}
            alt="プレビュー"
            fill
            sizes="208px"
            className="object-cover"
            onError={(e) => {
              console.error("画像読み込みエラー:", imagePreview);
            }}
          />
          <button
            type="button"
            onClick={triggerFileUpload}
            className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white py-2 px-2 text-sm flex items-center justify-center hover:bg-opacity-80"
            aria-label="画像を変更"
          >
            <ImagePlus className="h-4 w-4 mr-1" />
            画像を変更
          </button>
        </div>
      ) : (
        <div
          className="relative flex flex-col items-center justify-center w-52 h-52 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 hover:bg-gray-50"
          onClick={triggerFileUpload}
        >
          <div className="flex flex-col items-center space-y-2 p-4 pointer-events-none">
            <UploadCloud className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-500">
              クリックして画像をアップロード（1枚のみ）
            </div>
          </div>
        </div>
      )}
      {/* file input は常に存在するが非表示 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        id="imageUploadInput" // id を追加し、label との関連付けを避ける
      />
      {/* 動的フィールド名でフォームに登録 */}
      <input type="hidden" {...form.register(imageUrlField)} />
      <input type="hidden" {...form.register(imagePathField)} />
    </div>
  );
};

export default ImageUploader;
